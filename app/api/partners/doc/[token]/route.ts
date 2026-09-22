import { NextResponse } from "next/server";
import { getApplicationByDocToken, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { readContractFile } from "@/lib/contract/storage";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  if (!/^[a-f0-9]{32}$/.test(token)) {
    return NextResponse.json({ error: "문서를 찾을 수 없습니다." }, { status: 404 });
  }
  let application;
  try {
    application = await getApplicationByDocToken(token);
  } catch {
    return NextResponse.json({ error: "문서를 찾을 수 없습니다." }, { status: 404 });
  }
  if (!application || !application.docPath || application.docRevoked) {
    return NextResponse.json({ error: "문서를 찾을 수 없습니다." }, { status: 404 });
  }
  const bytes = await readContractFile(application.docPath);
  if (!bytes) return NextResponse.json({ error: "문서를 찾을 수 없습니다." }, { status: 404 });
  await writeAuditLog({
    applicationId: application.id,
    userId: application.userId,
    event: "DOC_ACCESS",
    meta: { tokenPrefix: token.slice(0, 8) },
    ip: clientIp(request),
    userAgent: clientUserAgent(request),
  });
  const fileName = `TY_위촉계약서_${application.certName || "계약"}_${application.id.slice(0, 8)}.pdf`;
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
