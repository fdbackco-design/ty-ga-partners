import { NextResponse } from "next/server";
import {
  toConsultationSummary,
  toPublicConsultation,
  validateConsultBirthdate,
  validateConsultContent,
  validateConsultName,
  validateConsultPhone,
  type Consultation,
} from "@/lib/consultations";
import { CONSULT_COOKIE, consultCookieOptions, createConsultToken, getConsultAccess } from "@/lib/consultCookie";
import { getConsultations, saveConsultation } from "@/lib/consultationsStore";
import { sendConsultNotice } from "@/lib/mail";

export const runtime = "nodejs";

export async function GET() {
  const access = await getConsultAccess();
  const items = await getConsultations();
  return NextResponse.json({
    items: items.map((item) => toConsultationSummary(item, access)),
  });
}

export async function POST(request: Request) {
  let body: { name?: string; birthdate?: string; phone?: string; content?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const nameError = validateConsultName(String(body.name || ""));
  if (nameError) return NextResponse.json({ error: nameError }, { status: 400 });
  const birthError = validateConsultBirthdate(String(body.birthdate || ""));
  if (birthError) return NextResponse.json({ error: birthError }, { status: 400 });
  const phoneError = validateConsultPhone(String(body.phone || ""));
  if (phoneError) return NextResponse.json({ error: phoneError }, { status: 400 });
  const contentError = validateConsultContent(String(body.content || ""));
  if (contentError) return NextResponse.json({ error: contentError }, { status: 400 });

  const access = await getConsultAccess();
  const item: Consultation = {
    id: crypto.randomUUID(),
    name: String(body.name || "").trim(),
    birthdate: String(body.birthdate || ""),
    phone: String(body.phone || "").replace(/\D/g, ""),
    content: String(body.content || "").trim(),
    replies: [],
    createdAt: new Date().toISOString(),
  };

  try {
    await saveConsultation(item);
  } catch (error) {
    console.error("[consultations] 저장 실패", error);
    return NextResponse.json({ error: "상담신청 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  }
  try {
    await sendConsultNotice(item);
  } catch (error) {
    console.error("[mail] 상담신청 알림 메일 발송 실패", error);
  }

  const ownedIds = [...access.ownedIds, item.id];
  const res = NextResponse.json({ item: toPublicConsultation(item, { isAdmin: access.isAdmin, ownedIds }) });
  res.cookies.set(CONSULT_COOKIE, createConsultToken(ownedIds), consultCookieOptions());
  return res;
}
