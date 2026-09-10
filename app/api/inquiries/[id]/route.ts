import { NextResponse } from "next/server";
import { canViewInquiry } from "@/lib/inquiries";
import { getInquiry } from "@/lib/inquiriesStore";
import { getViewer } from "@/lib/viewer";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const viewer = await getViewer();
  const { id } = await context.params;
  const item = await getInquiry(id);
  if (!item) return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
  if (!canViewInquiry(item, viewer)) {
    return NextResponse.json({ error: "비밀글은 작성자와 관리자만 볼 수 있습니다." }, { status: 403 });
  }
  return NextResponse.json({ item });
}
