import { NextResponse } from "next/server";
import { digitsOnly, validatePassword, validatePhone } from "@/lib/auth";
import { MEMBER_COOKIE, createMemberToken, memberCookieOptions, memberSessionFromUser } from "@/lib/member";
import { getSignedInMemberUser } from "@/lib/partnerAccess";
import { getApplicationByUserId, phoneChangeLocked } from "@/lib/partnerApplicationsStore";
import { VERIFY_COOKIE, verifyCookieOptions } from "@/lib/partnerVerifyToken";
import { listPhoneHistory, findUserById, toProfile, updateUserPassword, updateUserPhone } from "@/lib/usersStore";

export const runtime = "nodejs";

async function accountPayload(userId: string) {
  const latest = await findUserById(userId);
  if (!latest) return null;
  const application = await getApplicationByUserId(userId);
  const history = await listPhoneHistory(userId);
  return {
    user: toProfile(latest),
    phoneLocked: phoneChangeLocked(application),
    phoneHistory: history,
  };
}

export async function GET() {
  const user = await getSignedInMemberUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try {
    const payload = await accountPayload(user.id);
    if (!payload) return NextResponse.json({ error: "회원 정보를 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "회원 정보를 불러오지 못했습니다.";
    const status = message.includes("Supabase가 설정되지 않았습니다") || message.includes("마이그레이션") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  const user = await getSignedInMemberUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  let body: {
    phone?: string;
    currentPassword?: string;
    password?: string;
    passwordConfirm?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    if (body.phone !== undefined) {
      const phone = digitsOnly(String(body.phone || ""));
      const phoneError = validatePhone(phone);
      if (phoneError) return NextResponse.json({ error: phoneError }, { status: 400 });
      const application = await getApplicationByUserId(user.id);
      if (phoneChangeLocked(application)) {
        return NextResponse.json({ error: "사원코드가 발급된 뒤에는 휴대폰 번호를 바꿀 수 없습니다." }, { status: 403 });
      }
      if (phone === digitsOnly(user.phone)) {
        return NextResponse.json({ error: "현재 번호와 다른 휴대폰 번호를 입력해 주세요." }, { status: 400 });
      }
      const updated = await updateUserPhone(user.id, user.phone, phone);
      const payload = await accountPayload(updated.id);
      const res = NextResponse.json({ ok: true, ...payload });
      res.cookies.set(MEMBER_COOKIE, createMemberToken(memberSessionFromUser(updated)), memberCookieOptions());
      res.cookies.set(VERIFY_COOKIE, "", { ...verifyCookieOptions(), maxAge: 0 });
      return res;
    }

    if (body.password !== undefined || body.currentPassword !== undefined) {
      const currentPassword = String(body.currentPassword || "");
      const password = String(body.password || "");
      const passwordConfirm = String(body.passwordConfirm || "");
      if (!currentPassword) return NextResponse.json({ error: "현재 비밀번호를 입력해 주세요." }, { status: 400 });
      const passwordError = validatePassword(password);
      if (passwordError) return NextResponse.json({ error: passwordError }, { status: 400 });
      if (password !== passwordConfirm) {
        return NextResponse.json({ error: "새 비밀번호가 일치하지 않습니다." }, { status: 400 });
      }
      if (password === currentPassword) {
        return NextResponse.json({ error: "현재 비밀번호와 다른 비밀번호를 입력해 주세요." }, { status: 400 });
      }
      await updateUserPassword(user.id, currentPassword, password);
      const payload = await accountPayload(user.id);
      return NextResponse.json({ ok: true, ...payload });
    }

    return NextResponse.json({ error: "변경할 항목이 없습니다." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "회원 정보 변경에 실패했습니다.";
    if (message.includes("현재 비밀번호가 올바르지 않습니다")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const status = message.includes("Supabase가 설정되지 않았습니다") || message.includes("마이그레이션") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
