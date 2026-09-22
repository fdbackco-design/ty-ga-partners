import { NextResponse } from "next/server";
import { z } from "zod";
import { runEmployeeIssue } from "@/lib/issue/runIssue";
import { isCompleteFlowStatus, publicIssueView } from "@/lib/partnerApplication";
import { getSignedInMemberUser } from "@/lib/partnerAccess";
import { getApplicationByUserId } from "@/lib/partnerApplicationsStore";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";

export const runtime = "nodejs";

const schema = z.object({
  confirm: z.literal(true),
});

export async function GET() {
  const user = await getSignedInMemberUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const application = await getApplicationByUserId(user.id);
  if (!application || !isCompleteFlowStatus(application.status, application.signedAt)) {
    return NextResponse.json({ error: "계약 체결 후 발급을 진행할 수 있습니다." }, { status: 400 });
  }
  return NextResponse.json({ issue: publicIssueView(application, user.username, user.rrnFront) });
}

export async function POST(request: Request) {
  const user = await getSignedInMemberUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const application = await getApplicationByUserId(user.id);
  if (!application || !isCompleteFlowStatus(application.status, application.signedAt)) {
    return NextResponse.json({ error: "계약 체결 후 발급을 진행할 수 있습니다." }, { status: 400 });
  }
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!schema.safeParse(raw).success) {
    return NextResponse.json({ error: "발급 확인이 필요합니다." }, { status: 400 });
  }

  const result = await runEmployeeIssue({
    user,
    application,
    actor: { kind: "user", id: user.id, ip: clientIp(request), userAgent: clientUserAgent(request) },
  });

  if (result.ok) {
    return NextResponse.json({ ok: true, status: result.status, empCode: result.empCode, already: result.already });
  }
  return NextResponse.json(
    { ok: false, error: result.error, status: result.status },
    { status: result.http === 202 ? 200 : result.http },
  );
}
