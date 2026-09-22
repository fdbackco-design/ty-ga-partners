import { NextResponse } from "next/server";
import { z } from "zod";
import { getContractApiContext } from "@/lib/contract/apiAuth";
import { generateContractPdf, newDocToken } from "@/lib/contract/pdf";
import { readContractFile, saveContractFile } from "@/lib/contract/storage";
import { decryptSecret } from "@/lib/crypto";
import { logError } from "@/lib/log";
import { claimSigning, patchApplication, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { contractStepReady } from "@/lib/partnerAccess";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";

export const runtime = "nodejs";

const schema = z.object({
  confirm: z.literal(true),
});

export async function POST(request: Request) {
  const ctx = await getContractApiContext();
  if ("error" in ctx) return ctx.error;
  if (!contractStepReady(ctx.application, "review")) {
    return NextResponse.json({ error: "계약 내용을 모두 작성해 주세요." }, { status: 400 });
  }
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!schema.safeParse(raw).success) {
    return NextResponse.json({ error: "계약 체결 확인이 필요합니다." }, { status: 400 });
  }

  const claimed = await claimSigning(ctx.application.id);
  if (!claimed) {
    return NextResponse.json({ error: "이미 제출 중이거나 체결된 계약입니다." }, { status: 409 });
  }

  const ip = clientIp(request);
  const userAgent = clientUserAgent(request);
  try {
    if (!claimed.ssnBackEnc || !claimed.accountNoEnc || !claimed.signaturePath) {
      throw new Error("작성 정보가 부족합니다.");
    }
    const signature = await readContractFile(claimed.signaturePath);
    if (!signature) throw new Error("서명 파일을 찾을 수 없습니다.");
    const signedAt = new Date().toISOString();
    const pdf = await generateContractPdf({
      application: { ...claimed, signedAt },
      ssnFull: `${(claimed.certBirthdate || "").slice(2)}${decryptSecret(claimed.ssnBackEnc)}`,
      accountNo: decryptSecret(claimed.accountNoEnc),
      signaturePng: signature,
      ip,
      userAgent,
    });
    const docPath = await saveContractFile(claimed.id, "signed.pdf", pdf.bytes);
    const saved = await patchApplication(claimed.id, {
      status: "CONTRACT_SIGNED",
      doc_token: newDocToken(),
      doc_path: docPath,
      doc_hash: pdf.fullHash,
      doc_revoked: false,
      signed_at: signedAt,
    });
    await writeAuditLog({
      applicationId: saved.id,
      userId: ctx.user.id,
      event: "CONTRACT_SUBMIT",
      meta: { docHashPrefix: (pdf.fullHash || "").slice(0, 12) },
      ip,
      userAgent,
    });
    return NextResponse.json({ ok: true, status: saved.status });
  } catch (error) {
    await patchApplication(claimed.id, { status: "CONTRACT" });
    logError("contract.submit", error);
    return NextResponse.json({ error: "계약서 생성에 실패했습니다." }, { status: 500 });
  }
}
