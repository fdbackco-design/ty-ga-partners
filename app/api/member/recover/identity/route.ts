import { NextResponse } from "next/server";
import { createRecoverToken, parseRecoverCert, recoverPurpose } from "@/lib/memberRecover";
import { maskUsername } from "@/lib/partnerCert";
import { countRecoverAttemptsByIp, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";
import { findUsersByIdentity } from "@/lib/usersStore";

export const runtime = "nodejs";

const MAX_ATTEMPTS_PER_HOUR = 5;

export async function POST(request: Request) {
  const ip = clientIp(request) || "unknown";
  const userAgent = clientUserAgent(request);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const attempts = await countRecoverAttemptsByIp(ip);
    if (attempts >= MAX_ATTEMPTS_PER_HOUR) {
      return NextResponse.json({ error: "인증 시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
    }

    const purpose = recoverPurpose(raw);
    const parsed = parseRecoverCert(raw);
    if ("error" in parsed) {
      await writeAuditLog({
        event: "ACCOUNT_RECOVER",
        meta: { purpose, reason: "invalid_cert" },
        ip,
        userAgent,
      });
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }

    const users = await findUsersByIdentity(parsed.identity);
    await writeAuditLog({
      userId: users[0]?.id ?? null,
      event: "ACCOUNT_RECOVER",
      meta: { purpose, found: users.length, diPrefix: parsed.identity.di.slice(0, 8) },
      ip,
      userAgent,
    });

    if (!users.length) {
      return NextResponse.json({ error: "가입된 아이디를 찾지 못했습니다." }, { status: 404 });
    }

    const accounts = users.map((user) => ({
      id: user.id,
      usernameMasked: maskUsername(user.username),
    }));

    return NextResponse.json({
      ok: true,
      accounts,
      token: purpose === "password" ? createRecoverToken(users.map((user) => user.id)) : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "본인인증 검증에 실패했습니다.";
    const status = message.includes("Supabase가 설정되지 않았습니다") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
