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
  if (isIssued(application)) redirect("/partners/apply/complete");
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
