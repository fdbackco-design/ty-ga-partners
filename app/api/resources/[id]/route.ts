import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";
import { getResourceAccess } from "@/lib/resourceAccess";
import { publicResource } from "@/lib/resources";
import { getResource, removeResource } from "@/lib/resourcesStore";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const access = await getResourceAccess();
  if (!access.canView) {
    return NextResponse.json({ error: "로그인 후 자료를 확인할 수 있습니다.", loginRequired: true }, { status: 401 });
  }
  const { id } = await context.params;
  const item = await getResource(id);
  if (!item) return NextResponse.json({ error: "자료를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ item: publicResource(item, access.canDownload), canDownload: access.canDownload });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ error: "관리자만 자료를 삭제할 수 있습니다." }, { status: 401 });
  }
  const { id } = await context.params;
  const item = await removeResource(id);
  if (!item) return NextResponse.json({ error: "자료를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
