import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminAccess";
import { getApplicationById, listAuditLogs, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { findUserById } from "@/lib/usersStore";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const application = await getApplicationById(id);
  if (!application) return NextResponse.json({ error: "신청 건을 찾을 수 없습니다." }, { status: 404 });
  const user = await findUserById(application.userId);
  const logs = await listAuditLogs(application.id);
  await writeAuditLog({
    applicationId: application.id,
    userId: application.userId,
    event: "ADMIN_VIEW",
    meta: { admin: auth.admin, detail: true },
    ip: clientIp(request),
    userAgent: clientUserAgent(request),
  });
  return NextResponse.json({
    application: {
      id: application.id,
      status: application.status,
      channelSlug: application.channelSlug,
      orgCode: application.orgCode,
      orgName: application.orgName,
      joinChannel: application.joinChannel,
      certName: application.certName,
      certMobile: application.certMobile,
      ssnMasked: application.ssnMasked,
      ssnGenderCode: application.ssnGenderCode,
      zipCode: application.zipCode,
      address1: application.address1,
      address2: application.address2,
      bankName: application.bankName,
      accountNoMasked: application.accountNoMasked,
      accountHolder: application.accountHolder,
      agreements: application.agreements,
      privacyAgreed: application.privacyAgreed,
      docToken: application.docToken,
      docHash: application.docHash,
      docRevoked: application.docRevoked,
      signedAt: application.signedAt,
      empId: application.empId || user?.username || "",
      empCode: application.empCode,
      issuedAt: application.issuedAt,
      issueAttempts: application.issueAttempts,
      lastErrorCode: application.lastErrorCode,
      lastErrorMessage: application.lastErrorMessage,
      manualCheckNote: application.manualCheckNote,
      manualResolvedBy: application.manualResolvedBy,
      manualResolvedAt: application.manualResolvedAt,
    },
    user: user
      ? { username: user.username, name: user.name, phone: user.phone, rrnFront: user.rrnFront }
      : null,
    logs,
  });
}
