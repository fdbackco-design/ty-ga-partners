import { NextResponse } from "next/server";
import { parseReleaseInput } from "@/lib/releases";
import { addRelease, usingBlob } from "@/lib/releasesStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.VERCEL && !usingBlob()) {
    return NextResponse.json(
      { error: "지금은 해촉 신청을 저장할 수 없습니다. 고객센터로 문의해 주세요." },
      { status: 503 },
    );
  }

  let body: { name?: string; phone?: string; memo?: string; privacyAgreed?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "신청 내용을 확인하지 못했습니다." }, { status: 400 });
  }

  const parsed = parseReleaseInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const item = await addRelease({ name: parsed.name, phone: parsed.phone, memo: parsed.memo });
  return NextResponse.json({ ok: true, id: item.id });
}
