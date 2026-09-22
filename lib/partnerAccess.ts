import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CHANNEL_COOKIE, resolveChannel, type Channel } from "@/config/channels";
import { getMemberFromCookies } from "@/lib/member";
import {
  ensureDraftApplication,
  isIssued,
  isVerifiedOrLater,
  writeAuditLog,
} from "@/lib/partnerApplicationsStore";
import { getVerifySessionFromCookies } from "@/lib/partnerVerifyToken";
import { findUserByUsername, type StoredUser } from "@/lib/usersStore";
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
  return resolveChannel(jar.get(CHANNEL_COOKIE)?.value).channel;
}

export async function preparePartnerApplication(user: StoredUser, requestedCh?: string | null) {
  const cookieChannel = await readChannelFromCookies();
  const resolved = resolveChannel(requestedCh ?? cookieChannel.slug);
  if (resolved.missed) {
    await writeAuditLog({
      userId: user.id,
      event: "channel_miss",
      meta: { requested: resolved.requested },
    });
  }
  const application = await ensureDraftApplication(user.id, resolved.channel);
  return { application, channel: resolved.channel };
}

export async function requireApplyAccess(nextPath: string, requestedCh?: string | null) {
  const user = await requireMemberUser(nextPath);
  const { application, channel } = await preparePartnerApplication(user, requestedCh);
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
