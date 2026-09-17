import { NextResponse } from "next/server";
import { z } from "zod";
import { getSignedInMemberUser, readChannelFromCookies } from "@/lib/partnerAccess";
import { countCertAttempts, ensureDraftApplication, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";
import type { AuditEvent } from "@/lib/partnerApplication";

export const runtime = "nodejs";

const MAX_ATTEMPTS_PER_HOUR = 5;

const bodySchema = z.object({
  event: z.enum(["CERT_OPENED", "CERT_TIMEOUT"]),
});

export async function POST(request: Request) {
  const user = await getSignedInMemberUser();
  if (!user) {
    return NextResponse.json({ error: "로그인 후 본인인증을 진행해 주세요." }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const ip = clientIp(request);
  const userAgent = clientUserAgent(request);
  const channel = await readChannelFromCookies();
  const application = await ensureDraftApplication(user.id, channel);

  if (parsed.data.event === "CERT_OPENED") {
    const attempts = await countCertAttempts(user.id);
    if (attempts >= MAX_ATTEMPTS_PER_HOUR) {
      return NextResponse.json({ error: "인증 시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
    }
  }

  const event: AuditEvent = parsed.data.event;
  await writeAuditLog({
    applicationId: application.id,
    userId: user.id,
    event,
    ip,
    userAgent,
  });

  return NextResponse.json({ ok: true });
}
