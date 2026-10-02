import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CHANNEL_COOKIE, type Channel } from "@/config/channels";
import { resolveActiveChannel, resolveStoredChannel } from "@/lib/channelsStore";
import { MEMBER_COOKIE, getMemberFromCookies } from "@/lib/member";
import {
  ensureDraftApplication,
  getApplicationByUserId,
  isIssued,
  isVerifiedOrLater,
} from "@/lib/partnerApplicationsStore";
import { getVerifySessionFromCookies, VERIFY_COOKIE } from "@/lib/partnerVerifyToken";
import { findUserByUsername, setUserChannel, type StoredUser } from "@/lib/usersStore";
import {
  isCompleteFlowStatus,
  needsEmpAccountCorrection,
  type PartnerApplication,
} from "@/lib/partnerApplication";

export async function getSignedInMemberUser(): Promise<StoredUser | null> {
  const session = await getMemberFromCookies();
  if (!session) return null;
  return findUserByUsername(session.username);
}

/** 탈퇴·해촉 등으로 DB 회원이 없는데 로그인 쿠키만 남은 경우 정리 */
export async function clearStaleMemberSession() {
  const session = await getMemberFromCookies();
  if (!session) return false;
  const user = await findUserByUsername(session.username);
  if (user) return false;
  const jar = await cookies();
  jar.delete(MEMBER_COOKIE);
  jar.delete(VERIFY_COOKIE);
  return true;
}

export async function requireMemberUser(nextPath: string) {
  const user = await getSignedInMemberUser();
  if (!user) {
    await clearStaleMemberSession();
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export async function readChannelFromCookies(): Promise<Channel> {
  const jar = await cookies();
  const resolved = await resolveActiveChannel(jar.get(CHANNEL_COOKIE)?.value);
  return resolved.channel;
}

export async function channelForUser(user: StoredUser): Promise<Channel> {
  const existing = await getApplicationByUserId(user.id);
  if (existing) {
    return {
      slug: existing.channelSlug,
      orgCode: existing.orgCode,
      label: existing.joinChannel,
      joinChannel: existing.channelSlug,
      active: true,
    };
  }
  if (user.channel) return resolveStoredChannel(user.channel);
  return readChannelFromCookies();
}

export async function preparePartnerApplication(user: StoredUser) {
  const channel = await channelForUser(user);
  if (!user.channel) {
    await setUserChannel(user.id, channel.slug);
    user.channel = channel.slug;
  }
  const application = await ensureDraftApplication(user.id, channel);
  return { application, channel };
}

export async function requireApplyAccess(nextPath: string) {
  const user = await requireMemberUser(nextPath);
  const { application, channel } = await preparePartnerApplication(user);
  if (isIssued(application) || isCompleteFlowStatus(application.status, application.signedAt)) {
    redirect("/partners/apply/complete");
  }
  return { user, application, channel };
}

export async function requireVerifiedAccess(nextPath: string) {
  const { user, application, channel } = await requireApplyAccess(nextPath);
  const verify = await getVerifySessionFromCookies();
  const tokenOk = Boolean(verify && verify.userId === user.id && verify.applicationId === application.id);
  if (!isVerifiedOrLater(application) && !tokenOk) {
    redirect("/partners/apply/verify");
  }
  return { user, application, channel };
}

export async function requireContractSession(nextPath: string) {
  const { user, application, channel } = await requireVerifiedAccess(nextPath);
  const verify = await getVerifySessionFromCookies();
  const tokenOk = Boolean(verify && verify.userId === user.id && verify.applicationId === application.id);
  if (!tokenOk) redirect("/partners/apply/verify");
  if (isCompleteFlowStatus(application.status, application.signedAt)) {
    const fixingEmpAccount =
      nextPath.startsWith("/partners/apply/contract/account") && needsEmpAccountCorrection(application);
    if (!fixingEmpAccount) {
      redirect("/partners/apply/complete");
    }
  }
  return { user, application, channel };
}

export function contractStepReady(
  application: PartnerApplication,
  step: "info" | "account" | "bank" | "sign" | "review",
) {
  const agreed = Boolean(application.privacyAgreed && application.agreements && application.agreements.length >= 4);
  const hasInfo = agreed && Boolean(application.ssnMasked);
  const hasAccount = hasInfo && Boolean(application.empId && application.empPswdEnc);
  const hasBank = hasAccount && Boolean(application.bankCode);
  if (step === "info") return agreed;
  if (step === "account") return hasInfo;
  if (step === "bank") return hasAccount;
  if (step === "sign") return hasBank;
  return hasBank && Boolean(application.signaturePath);
}
