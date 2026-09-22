import { NextResponse } from "next/server";
import { z } from "zod";
import { getContractApiContext } from "@/lib/contract/apiAuth";
import { saveContractFile } from "@/lib/contract/storage";
import { patchApplication, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { publicContractDraft } from "@/lib/partnerApplication";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";
import { contractStepReady } from "@/lib/partnerAccess";

export const runtime = "nodejs";

const schema = z.object({
  image: z.string().startsWith("data:image/png;base64,"),
});

export async function POST(request: Request) {
  const ctx = await getContractApiContext();
  if ("error" in ctx) return ctx.error;
  if (!contractStepReady(ctx.application, "sign")) {
    return NextResponse.json({ error: "정산 계좌를 먼저 등록해 주세요." }, { status: 400 });
  }
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "서명 이미지가 올바르지 않습니다." }, { status: 400 });
  }
  const bytes = Buffer.from(parsed.data.image.split(",")[1] || "", "base64");
  if (bytes.length < 800) {
    return NextResponse.json({ error: "서명이 너무 짧습니다. 다시 작성해 주세요." }, { status: 400 });
  }
  const signaturePath = await saveContractFile(ctx.application.id, "signature.png", bytes);
  const saved = await patchApplication(ctx.application.id, {
    signature_path: signaturePath,
    signature_at: new Date().toISOString(),
  });
  await writeAuditLog({
    applicationId: saved.id,
    userId: ctx.user.id,
    event: "CONTRACT_SIGN",
    meta: {},
    ip: clientIp(request),
    userAgent: clientUserAgent(request),
  });
  return NextResponse.json({ draft: publicContractDraft(saved), path: signaturePath });
}
