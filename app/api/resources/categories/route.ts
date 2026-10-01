import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";
import { getResourceAccess } from "@/lib/resourceAccess";
import {
  addResourceCategory,
  getResourceCategoryState,
  reorderResourceCategories,
} from "@/lib/resourceCategoriesStore";

export const runtime = "nodejs";

export async function GET() {
  const access = await getResourceAccess();
  if (!access.canView) {
    return NextResponse.json({ error: "로그인 후 확인할 수 있습니다.", items: [] }, { status: 401 });
  }
  return NextResponse.json(await getResourceCategoryState());
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
  return NextResponse.json({ item: result.item, ...(await getResourceCategoryState()) });
}

export async function PATCH(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ error: "관리자만 분류 순서를 변경할 수 있습니다." }, { status: 401 });
  }
  const body = (await request.json()) as { ids?: string[] };
  const state = await reorderResourceCategories(Array.isArray(body.ids) ? body.ids.map(String) : []);
  if (!state) {
    return NextResponse.json({ error: "분류 순서가 올바르지 않습니다." }, { status: 400 });
  }
  return NextResponse.json(state);
}
