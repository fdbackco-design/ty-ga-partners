import { NextResponse } from "next/server";
import { getMemberFromCookies } from "@/lib/member";
import { findUserByUsername, toProfile } from "@/lib/usersStore";

export const runtime = "nodejs";

export async function GET() {
  const session = await getMemberFromCookies();
  if (!session) return NextResponse.json({ user: null });
  try {
    const user = await findUserByUsername(session.username);
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user: toProfile(user) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "회원 정보를 불러오지 못했습니다.";
    const status = message.includes("Supabase가 설정되지 않았습니다") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
