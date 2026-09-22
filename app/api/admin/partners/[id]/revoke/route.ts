import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/adminAccess";
import { getApplicationById, patchApplication, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.object({
  revoked: z.boolean(),
});

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const application = await getApplicationById(id);
  if (!application) return NextResponse.json({ error: "신청 건을 찾을 수 없습니다." }, { status: 404 });
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "요청이 올바르지 않습니다." }, { status: 400 });
  const saved = await patchApplication(application.id, { doc_revoked: parsed.data.revoked });
  await writeAuditLog({
    applicationId: application.id,
    userId: application.userId,
    event: "ADMIN_REVOKE",
    meta: { admin: auth.admin, revoked: parsed.data.revoked },
    ip: clientIp(request),
    userAgent: clientUserAgent(request),
  });
  return NextResponse.json({ ok: true, docRevoked: saved.docRevoked });
}
