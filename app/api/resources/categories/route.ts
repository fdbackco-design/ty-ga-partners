import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";
import { getResourceAccess } from "@/lib/resourceAccess";
import { addResourceCategory, getResourceCategories } from "@/lib/resourceCategoriesStore";

export const runtime = "nodejs";

export async function GET() {
  const access = await getResourceAccess();
  if (!access.canView) {
    return NextResponse.json({ error: "로그인 후 확인할 수 있습니다.", items: [] }, { status: 401 });
  }
  return NextResponse.json({ items: await getResourceCategories() });
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ error: "관리자만 분류를 추가할 수 있습니다." }, { status: 401 });
  }
  const body = (await request.json()) as { name?: string };
  const result = await addResourceCategory(String(body.name || ""));
  if (result.error || !result.item) {
    return NextResponse.json({ error: result.error || "분류를 추가하지 못했습니다." }, { status: 400 });
  }
  return NextResponse.json({ item: result.item, items: await getResourceCategories() });
}
