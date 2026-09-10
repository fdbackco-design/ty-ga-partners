import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";
import { getInquiry, saveInquiry } from "@/lib/inquiriesStore";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ error: "관리자만 답글을 남길 수 있습니다." }, { status: 401 });
  }

  let body: { content?: string };
  try {
    body = (await request.json()) as { content?: string };
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const content = String(body.content || "").trim();
  if (!content) {
    return NextResponse.json({ error: "답글 내용을 입력해 주세요." }, { status: 400 });
  }
  if (content.length > 5000) {
    return NextResponse.json({ error: "답글은 5,000자 이내로 입력해 주세요." }, { status: 400 });
  }

  const { id } = await context.params;
  const item = await getInquiry(id);
  if (!item) return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });

  item.replies = [
    ...item.replies,
    {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date().toISOString(),
    },
  ];
  await saveInquiry(item);
  return NextResponse.json({ item });
}
