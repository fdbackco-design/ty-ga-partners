import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminAccess";
import { RELEASE_STATUSES, type ReleaseStatus } from "@/lib/releases";
import { removeRelease, updateReleaseStatus } from "@/lib/releasesStore";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  let body: { status?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "상태를 확인하지 못했습니다." }, { status: 400 });
  }
  if (!RELEASE_STATUSES.includes(body.status as ReleaseStatus)) {
    return NextResponse.json({ error: "처리할 수 없는 상태입니다." }, { status: 400 });
  }
  const item = await updateReleaseStatus(id, body.status as ReleaseStatus);
  if (!item) return NextResponse.json({ error: "신청을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const item = await removeRelease(id);
  if (!item) return NextResponse.json({ error: "신청을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
