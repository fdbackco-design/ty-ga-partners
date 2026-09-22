import { NextResponse } from "next/server";
import { getSignedInMemberUser } from "@/lib/partnerAccess";
import { getApplicationByUserId } from "@/lib/partnerApplicationsStore";
import { getVerifySessionFromCookies } from "@/lib/partnerVerifyToken";
import { isCompleteFlowStatus, type PartnerApplication } from "@/lib/partnerApplication";
import type { StoredUser } from "@/lib/usersStore";

export async function getContractApiContext(): Promise<
  { error: NextResponse } | { user: StoredUser; application: PartnerApplication }
> {
  const user = await getSignedInMemberUser();
  if (!user) {
    return { error: NextResponse.json({ error: "로그인 후 계약을 진행해 주세요." }, { status: 401 }) };
  }
  const verify = await getVerifySessionFromCookies();
  const application = await getApplicationByUserId(user.id);
  if (!verify || !application || verify.userId !== user.id || verify.applicationId !== application.id) {
    return { error: NextResponse.json({ error: "본인인증 후 계약을 진행해 주세요." }, { status: 401 }) };
  }
  if (isCompleteFlowStatus(application.status, application.signedAt)) {
    return { error: NextResponse.json({ error: "이미 체결된 계약입니다." }, { status: 409 }) };
  }
  return { user, application };
}
