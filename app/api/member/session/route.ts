import { NextResponse } from "next/server";
import { MEMBER_COOKIE, createMemberToken, memberCookieOptions } from "@/lib/member";

export async function POST(request: Request) {
  let body: { username?: string; name?: string };
  try {
    body = (await request.json()) as { username?: string; name?: string };
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const username = String(body.username || "").trim();
  const name = String(body.name || "").trim();
  if (!/^[a-zA-Z0-9_]{4,20}$/.test(username) || !name || name.length > 40) {
    return NextResponse.json({ error: "회원 정보가 올바르지 않습니다." }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_COOKIE, createMemberToken({ username, name }), memberCookieOptions());
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_COOKIE, "", { ...memberCookieOptions(), maxAge: 0 });
  return res;
}
