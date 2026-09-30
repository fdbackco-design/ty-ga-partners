import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";
import { parseConsultReplyContent, toPublicConsultation, type Consultation } from "@/lib/consultations";
import { getConsultAccess } from "@/lib/consultCookie";
import { getConsultation, saveConsultation } from "@/lib/consultationsStore";

type RouteContext = { params: Promise<{ id: string; replyId: string }> };

async function loadAdminConsultation(id: string): Promise<{ item: Consultation } | { error: NextResponse }> {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return { error: NextResponse.json({ error: "관리자만 답변을 수정하거나 삭제할 수 있습니다." }, { status: 401 }) };
  }
  const item = await getConsultation(id);
  if (!item) return { error: NextResponse.json({ error: "상담신청을 찾을 수 없습니다." }, { status: 404 }) };
  return { item };
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id, replyId } = await context.params;
  const loaded = await loadAdminConsultation(id);
  if ("error" in loaded) return loaded.error;

  let body: { content?: string };
  try {
    body = (await request.json()) as { content?: string };
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const parsed = parseConsultReplyContent(body.content);
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
  try {
    await saveConsultation(item);
  } catch (error) {
    console.error("[consultations] 답변 수정 저장 실패", error);
    return NextResponse.json({ error: "답변 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
  const access = await getConsultAccess();
  return NextResponse.json({ item: toPublicConsultation(item, access) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id, replyId } = await context.params;
  const loaded = await loadAdminConsultation(id);
  if ("error" in loaded) return loaded.error;

  const exists = loaded.item.replies.some((reply) => reply.id === replyId);
  if (!exists) {
    return NextResponse.json({ error: "답변을 찾을 수 없습니다." }, { status: 404 });
  }

  const item = {
    ...loaded.item,
    replies: loaded.item.replies.filter((reply) => reply.id !== replyId),
  };
  try {
    await saveConsultation(item);
  } catch (error) {
    console.error("[consultations] 답변 삭제 저장 실패", error);
    return NextResponse.json({ error: "답변 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
  const access = await getConsultAccess();
  return NextResponse.json({ item: toPublicConsultation(item, access) });
}
