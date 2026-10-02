import { NextResponse } from "next/server";
import { getSignedInMemberUser } from "@/lib/partnerAccess";
import { getApplicationByUserId } from "@/lib/partnerApplicationsStore";
import { getVerifySessionFromCookies } from "@/lib/partnerVerifyToken";
import { isCompleteFlowStatus, type PartnerApplication } from "@/lib/partnerApplication";
import type { StoredUser } from "@/lib/usersStore";

export async function getContractApiContext(options?: { allowSigned?: boolean }): Promise<
  { error: NextResponse } | { user: StoredUser; application: PartnerApplication }
> {
  const user = await getSignedInMemberUser();
  if (!user) {
    return { error: NextResponse.json({ error: "로그인 후 계약을 진행해 주세요." }, { status: 401 }) };
  }
  const verify = await getVerifySessionFromCookies();
  const application = await getApplicationByUserId(user.id);
  if (!application) {
    return { error: NextResponse.json({ error: "본인인증 후 계약을 진행해 주세요." }, { status: 401 }) };
  }
  const locked =
    application.status === "ISSUED" ||
    application.status === "SUBMITTING" ||
    application.status === "NEEDS_MANUAL_CHECK";
  if (options?.allowSigned) {
    if (locked) {
      return { error: NextResponse.json({ error: "이미 처리 중이거나 발급된 신청입니다." }, { status: 409 }) };
    }
    const tokenOk = Boolean(verify && verify.userId === user.id && verify.applicationId === application.id);
    if (!application.signedAt && !tokenOk) {
      return { error: NextResponse.json({ error: "본인인증 후 계약을 진행해 주세요." }, { status: 401 }) };
    }
    return { user, application };
  }
  if (!verify || verify.userId !== user.id || verify.applicationId !== application.id) {
    return { error: NextResponse.json({ error: "본인인증 후 계약을 진행해 주세요." }, { status: 401 }) };
  }
  if (isCompleteFlowStatus(application.status, application.signedAt)) {
    return { error: NextResponse.json({ error: "이미 체결된 계약입니다." }, { status: 409 }) };
  }
  return { user, application };
}
