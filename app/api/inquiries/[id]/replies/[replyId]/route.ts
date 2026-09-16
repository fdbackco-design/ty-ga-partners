import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";
import { parseInquiryReplyContent, toPublicInquiry, type Inquiry } from "@/lib/inquiries";
import { getInquiry, saveInquiry } from "@/lib/inquiriesStore";
import { getViewer } from "@/lib/viewer";

type RouteContext = { params: Promise<{ id: string; replyId: string }> };

async function loadAdminInquiry(id: string): Promise<{ item: Inquiry } | { error: NextResponse }> {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return { error: NextResponse.json({ error: "관리자만 답변을 수정하거나 삭제할 수 있습니다." }, { status: 401 }) };
  }
  const item = await getInquiry(id);
  if (!item) return { error: NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 }) };
  return { item };
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id, replyId } = await context.params;
  const loaded = await loadAdminInquiry(id);
  if ("error" in loaded) return loaded.error;

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

  const index = loaded.item.replies.findIndex((reply) => reply.id === replyId);
  if (index < 0) {
    return NextResponse.json({ error: "답변을 찾을 수 없습니다." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const replies = loaded.item.replies.map((reply, replyIndex) =>
    replyIndex === index ? { ...reply, content: parsed.content, updatedAt: now } : reply,
  );
  const item = { ...loaded.item, replies };
  await saveInquiry(item);
  const viewer = await getViewer();
  return NextResponse.json({ item: toPublicInquiry(item, viewer) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id, replyId } = await context.params;
  const loaded = await loadAdminInquiry(id);
  if ("error" in loaded) return loaded.error;

  const exists = loaded.item.replies.some((reply) => reply.id === replyId);
  if (!exists) {
    return NextResponse.json({ error: "답변을 찾을 수 없습니다." }, { status: 404 });
  }

  const item = {
    ...loaded.item,
    replies: loaded.item.replies.filter((reply) => reply.id !== replyId),
  };
  await saveInquiry(item);
  const viewer = await getViewer();
  return NextResponse.json({ item: toPublicInquiry(item, viewer) });
}
