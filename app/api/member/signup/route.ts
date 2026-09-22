import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CHANNEL_COOKIE } from "@/config/channels";
import { resolveActiveChannel } from "@/lib/channelsStore";
import {
  digitsOnly,
  validateName,
  validatePassword,
  validatePhone,
  validateRrnBackFirst,
  validateRrnFront,
  validateUsername,
} from "@/lib/auth";
import { MEMBER_COOKIE, createMemberToken, memberCookieOptions, memberSessionFromUser } from "@/lib/member";
import { createUser, toProfile } from "@/lib/usersStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    username?: string;
    password?: string;
    passwordConfirm?: string;
    name?: string;
    phone?: string;
    rrnFront?: string;
    rrnBackFirst?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const username = String(body.username || "");
  const password = String(body.password || "");
  const passwordConfirm = String(body.passwordConfirm || "");
  const name = String(body.name || "");
  const phone = digitsOnly(String(body.phone || ""));
  const rrnFront = digitsOnly(String(body.rrnFront || "")).slice(0, 6);
  const rrnBackFirst = digitsOnly(String(body.rrnBackFirst || "")).slice(0, 1);

  const usernameError = validateUsername(username);
  if (usernameError) return NextResponse.json({ error: usernameError }, { status: 400 });
  const passwordError = validatePassword(password);
  if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
  if (password !== passwordConfirm) {
    return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 400 });
  }
  const nameError = validateName(name);
  if (nameError) return NextResponse.json({ error: nameError }, { status: 400 });
  const phoneError = validatePhone(phone);
  if (phoneError) return NextResponse.json({ error: phoneError }, { status: 400 });
  const rrnFrontError = validateRrnFront(rrnFront);
  if (rrnFrontError) return NextResponse.json({ error: rrnFrontError }, { status: 400 });
  const rrnBackError = validateRrnBackFirst(rrnBackFirst);
  if (rrnBackError) return NextResponse.json({ error: rrnBackError }, { status: 400 });

  try {
    const jar = await cookies();
    const resolved = await resolveActiveChannel(jar.get(CHANNEL_COOKIE)?.value);
    const user = await createUser({
      username,
      password,
      name,
      phone,
      rrnFront,
      rrnBackFirst,
      channel: resolved.channel.slug,
    });
    const profile = toProfile(user);
    const res = NextResponse.json({ ok: true, user: profile });
    res.cookies.set(MEMBER_COOKIE, createMemberToken(memberSessionFromUser(user)), memberCookieOptions());
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : "회원가입에 실패했습니다.";
    const status = message.includes("이미 사용 중")
      ? 409
      : message.includes("Supabase가 설정되지 않았습니다")
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
