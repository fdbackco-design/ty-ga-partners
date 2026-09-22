import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CHANNEL_COOKIE, type Channel } from "@/config/channels";
import { resolveActiveChannel, resolveStoredChannel } from "@/lib/channelsStore";
import { getMemberFromCookies } from "@/lib/member";
import {
  ensureDraftApplication,
  getApplicationByUserId,
  isIssued,
  isVerifiedOrLater,
} from "@/lib/partnerApplicationsStore";
import { getVerifySessionFromCookies } from "@/lib/partnerVerifyToken";
import { findUserByUsername, setUserChannel, type StoredUser } from "@/lib/usersStore";
import { isCompleteFlowStatus, type PartnerApplication } from "@/lib/partnerApplication";

export async function getSignedInMemberUser(): Promise<StoredUser | null> {
  const session = await getMemberFromCookies();
  if (!session) return null;
  return findUserByUsername(session.username);
}

export async function requireMemberUser(nextPath: string) {
  const user = await getSignedInMemberUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
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
    redirect("/partners/apply/complete");
  }
  return { user, application, channel };
}

export function contractStepReady(application: PartnerApplication, step: "info" | "bank" | "sign" | "review") {
  const agreed = Boolean(application.privacyAgreed && application.agreements && application.agreements.length >= 4);
  if (step === "info") return agreed;
  if (step === "bank") return agreed && Boolean(application.ssnMasked);
  if (step === "sign") return agreed && Boolean(application.ssnMasked && application.bankCode);
  return agreed && Boolean(application.ssnMasked && application.bankCode && application.signaturePath);
}
