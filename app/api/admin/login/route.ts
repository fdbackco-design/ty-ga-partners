import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminConfigured,
  cookieOptions,
  createAdminToken,
  getAdminCredentials,
  safeEqual,
} from "@/lib/admin";

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "관리자 계정이 설정되지 않았습니다. ADMIN_USERNAME, ADMIN_PASSWORD를 등록해 주세요." },
      { status: 503 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = (await request.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { username, password } = getAdminCredentials();
  const inputUser = String(body.username || "").trim();
  const inputPass = String(body.password || "");
  if (!safeEqual(inputUser, username) || !safeEqual(inputPass, password)) {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, username });
  res.cookies.set(ADMIN_COOKIE, createAdminToken(username), cookieOptions());
  return res;
}
