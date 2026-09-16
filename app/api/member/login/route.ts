import { NextResponse } from "next/server";
import { MEMBER_COOKIE, createMemberToken, memberCookieOptions, memberSessionFromUser } from "@/lib/member";
import { authenticateUser, toProfile } from "@/lib/usersStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  if (!username || !password) {
    return NextResponse.json({ error: "아이디와 비밀번호를 입력해 주세요." }, { status: 400 });
  }

  try {
    const user = await authenticateUser(username, password);
    if (!user) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const profile = toProfile(user);
    const res = NextResponse.json({ ok: true, user: profile });
    res.cookies.set(MEMBER_COOKIE, createMemberToken(memberSessionFromUser(user)), memberCookieOptions());
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : "로그인에 실패했습니다.";
    const status = message.includes("Supabase가 설정되지 않았습니다") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
