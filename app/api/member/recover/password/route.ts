import { NextResponse } from "next/server";
import { validatePassword } from "@/lib/auth";
import { verifyRecoverToken } from "@/lib/memberRecover";
import { writeAuditLog } from "@/lib/partnerApplicationsStore";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";
import { findUserById, setUserPasswordById } from "@/lib/usersStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = clientIp(request) || "unknown";
  const userAgent = clientUserAgent(request);

  let body: { token?: string; userId?: string; password?: string; passwordConfirm?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const recovered = verifyRecoverToken(String(body.token || ""));
  if (!recovered) {
    return NextResponse.json({ error: "인증 유효 시간이 지났습니다. 다시 인증해 주세요." }, { status: 401 });
  }

  const userId = String(body.userId || "");
  if (!userId || !recovered.userIds.includes(userId)) {
    return NextResponse.json({ error: "아이디를 다시 확인해 주세요." }, { status: 400 });
  }

  const password = String(body.password || "");
  const passwordConfirm = String(body.passwordConfirm || "");
  const passwordError = validatePassword(password);
  if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
  if (password !== passwordConfirm) {
    return NextResponse.json({ error: "새 비밀번호가 일치하지 않습니다." }, { status: 400 });
  }

  try {
    const user = await findUserById(userId);
    if (!user) return NextResponse.json({ error: "회원 정보를 찾을 수 없습니다." }, { status: 404 });
    await setUserPasswordById(user.id, password);
    await writeAuditLog({
      userId: user.id,
      event: "ACCOUNT_RECOVER",
      meta: { purpose: "password", step: "reset" },
      ip,
      userAgent,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "비밀번호 변경에 실패했습니다.";
    const status = message.includes("Supabase가 설정되지 않았습니다") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
