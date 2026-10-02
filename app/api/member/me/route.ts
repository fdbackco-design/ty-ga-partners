import { NextResponse } from "next/server";
import { getMemberFromCookies, MEMBER_COOKIE, memberCookieOptions } from "@/lib/member";
import { loadMemberPartner } from "@/lib/memberPartner";
import { VERIFY_COOKIE, verifyCookieOptions } from "@/lib/partnerVerifyToken";
import { findUserByUsername, toProfile } from "@/lib/usersStore";

export const runtime = "nodejs";

export async function GET() {
  const session = await getMemberFromCookies();
  if (!session) return NextResponse.json({ user: null, partner: null });
  try {
    const user = await findUserByUsername(session.username);
    if (!user) {
      const res = NextResponse.json({ user: null, partner: null });
      res.cookies.set(MEMBER_COOKIE, "", { ...memberCookieOptions(), maxAge: 0 });
      res.cookies.set(VERIFY_COOKIE, "", { ...verifyCookieOptions(), maxAge: 0 });
      return res;
    }
    const partner = await loadMemberPartner(user.id, user.username);
    return NextResponse.json({ user: toProfile(user), partner });
  } catch (error) {
    const message = error instanceof Error ? error.message : "회원 정보를 불러오지 못했습니다.";
    const status = message.includes("Supabase가 설정되지 않았습니다") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
