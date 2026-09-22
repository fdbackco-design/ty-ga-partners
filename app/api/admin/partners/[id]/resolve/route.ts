import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/adminAccess";
import { runEmployeeIssue } from "@/lib/issue/runIssue";
import { getApplicationById, patchApplication, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { findUserById } from "@/lib/usersStore";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("already_issued"),
    empCode: z.string().trim().min(4).max(32),
    note: z.string().trim().max(500).optional(),
  }),
  z.object({
    action: z.literal("retry"),
    note: z.string().trim().max(500).optional(),
  }),
]);

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const application = await getApplicationById(id);
  if (!application) return NextResponse.json({ error: "신청 건을 찾을 수 없습니다." }, { status: 404 });
  const user = await findUserById(application.userId);
  if (!user) return NextResponse.json({ error: "회원 정보를 찾을 수 없습니다." }, { status: 400 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "처리 내용이 올바르지 않습니다." }, { status: 400 });

  if (parsed.data.action === "already_issued") {
    if (application.status === "ISSUED") {
      return NextResponse.json({ ok: true, status: "ISSUED", empCode: application.empCode });
    }
    const saved = await patchApplication(application.id, {
      status: "ISSUED",
      emp_code: parsed.data.empCode,
      emp_id: application.empId || user.username,
      issued_at: new Date().toISOString(),
      org_name: application.orgName || application.joinChannel,
      manual_check_note: parsed.data.note || "이미 등록됨",
      manual_resolved_by: auth.admin,
      manual_resolved_at: new Date().toISOString(),
      last_error_code: null,
      last_error_message: null,
    });
    await writeAuditLog({
      applicationId: application.id,
      userId: application.userId,
      event: "MANUAL_RESOLVED",
      meta: { admin: auth.admin, action: "already_issued", empCode: parsed.data.empCode, note: parsed.data.note || "" },
      ip: clientIp(request),
      userAgent: clientUserAgent(request),
    });
    return NextResponse.json({ ok: true, status: saved.status, empCode: saved.empCode });
  }

  const result = await runEmployeeIssue({
    user,
    application,
    actor: { kind: "admin", id: auth.admin, ip: clientIp(request), userAgent: clientUserAgent(request) },
  });
  await writeAuditLog({
    applicationId: application.id,
    userId: application.userId,
    event: "MANUAL_RESOLVED",
    meta: { admin: auth.admin, action: "retry", note: parsed.data.note || "", result: result.ok ? "ISSUED" : result.status },
    ip: clientIp(request),
    userAgent: clientUserAgent(request),
  });
  if (parsed.data.note) {
    await patchApplication(application.id, {
      manual_check_note: parsed.data.note,
      manual_resolved_by: auth.admin,
      manual_resolved_at: new Date().toISOString(),
    });
  }
  if (result.ok) return NextResponse.json({ ok: true, status: result.status, empCode: result.empCode });
  return NextResponse.json({ ok: false, error: result.error, status: result.status }, { status: result.http === 202 ? 200 : result.http });
}
