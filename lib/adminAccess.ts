import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";

export async function requireAdminApi() {
  const admin = await getAdminFromCookies();
  if (!admin) return { error: NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 401 }) };
  return { admin };
}
