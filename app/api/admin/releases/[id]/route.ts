import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminAccess";
import { RELEASE_STATUSES, type ReleaseStatus } from "@/lib/releases";
import { findReleaseById, removeRelease, updateReleaseStatus } from "@/lib/releasesStore";
import { deleteUserById } from "@/lib/usersStore";

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
  const nextStatus = body.status as ReleaseStatus;
  const before = await findReleaseById(id);
  if (!before) return NextResponse.json({ error: "신청을 찾을 수 없습니다." }, { status: 404 });

  const item = await updateReleaseStatus(id, nextStatus);
  if (!item) return NextResponse.json({ error: "신청을 찾을 수 없습니다." }, { status: 404 });

  if (nextStatus === "DONE" && before.status !== "DONE" && before.userId) {
    try {
      await deleteUserById(before.userId);
    } catch (error) {
      await updateReleaseStatus(id, before.status);
      const message = error instanceof Error ? error.message : "회원 탈퇴 처리에 실패했습니다.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

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
