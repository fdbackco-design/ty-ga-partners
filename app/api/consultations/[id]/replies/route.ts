import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";
import { parseConsultReplyContent, toPublicConsultation } from "@/lib/consultations";
import { getConsultAccess } from "@/lib/consultCookie";
import { getConsultation, saveConsultation } from "@/lib/consultationsStore";

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

  const parsed = parseConsultReplyContent(body.content);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { id } = await context.params;
  const item = await getConsultation(id);
  if (!item) return NextResponse.json({ error: "상담신청을 찾을 수 없습니다." }, { status: 404 });

  item.replies = [
    ...item.replies,
    {
      id: crypto.randomUUID(),
      content: parsed.content,
      createdAt: new Date().toISOString(),
    },
  ];
  try {
    await saveConsultation(item);
  } catch (error) {
    console.error("[consultations] 답변 저장 실패", error);
    return NextResponse.json({ error: "답변 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
  const access = await getConsultAccess();
  return NextResponse.json({ item: toPublicConsultation(item, access) });
}
