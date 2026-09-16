import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";
import { parseInquiryReplyContent, toPublicInquiry } from "@/lib/inquiries";
import { getInquiry, saveInquiry } from "@/lib/inquiriesStore";
import { getViewer } from "@/lib/viewer";

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

  const parsed = parseInquiryReplyContent(body.content);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { id } = await context.params;
  const item = await getInquiry(id);
  if (!item) return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });

  item.replies = [
    ...item.replies,
    {
      id: crypto.randomUUID(),
      content: parsed.content,
      createdAt: new Date().toISOString(),
    },
  ];
  await saveInquiry(item);
  const viewer = await getViewer();
  return NextResponse.json({ item: toPublicInquiry(item, viewer) });
}
