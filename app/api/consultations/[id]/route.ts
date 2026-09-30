import { NextResponse } from "next/server";
import {
  canDeleteConsultation,
  canManageConsultation,
  canViewConsultation,
  toPublicConsultation,
} from "@/lib/consultations";
import { getConsultAccess } from "@/lib/consultCookie";
import { getConsultation, removeConsultation } from "@/lib/consultationsStore";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const access = await getConsultAccess();
  const { id } = await context.params;
  const item = await getConsultation(id);
  if (!item) return NextResponse.json({ error: "상담신청을 찾을 수 없습니다." }, { status: 404 });
  if (!canViewConsultation(item, access)) {
    return NextResponse.json({ error: "상담 내용은 신청자와 관리자만 볼 수 있습니다." }, { status: 403 });
  }
  return NextResponse.json({
    item: toPublicConsultation(item, access),
    canManage: canManageConsultation(item, access),
    canDelete: canDeleteConsultation(item, access),
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const access = await getConsultAccess();
  const { id } = await context.params;
  const item = await getConsultation(id);
  if (!item) return NextResponse.json({ error: "상담신청을 찾을 수 없습니다." }, { status: 404 });
  if (!canDeleteConsultation(item, access)) {
    return NextResponse.json({ error: "신청자 또는 관리자만 삭제할 수 있습니다." }, { status: 403 });
  }
  try {
    await removeConsultation(id);
  } catch (error) {
    console.error("[consultations] 삭제 저장 실패", error);
    return NextResponse.json({ error: "상담신청 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
