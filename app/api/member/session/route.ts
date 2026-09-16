import { NextResponse } from "next/server";
import { MEMBER_COOKIE, memberCookieOptions } from "@/lib/member";

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(MEMBER_COOKIE, "", { ...memberCookieOptions(), maxAge: 0 });
  return res;
}
