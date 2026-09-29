import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";
import { getResourceCategories, removeResourceCategory } from "@/lib/resourceCategoriesStore";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ error: "관리자만 분류를 삭제할 수 있습니다." }, { status: 401 });
  }
  const { id } = await context.params;
  const item = await removeResourceCategory(id);
  if (!item) return NextResponse.json({ error: "분류를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true, items: await getResourceCategories() });
}
