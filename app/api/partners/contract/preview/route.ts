import { NextResponse } from "next/server";
import { getContractApiContext } from "@/lib/contract/apiAuth";
import { generateContractPdf } from "@/lib/contract/pdf";
import { readContractFile } from "@/lib/contract/storage";
import { decryptSecret } from "@/lib/crypto";
import { contractStepReady } from "@/lib/partnerAccess";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = await getContractApiContext();
  if ("error" in ctx) return ctx.error;
  if (!contractStepReady(ctx.application, "review")) {
    return NextResponse.json({ error: "서명을 먼저 완료해 주세요." }, { status: 400 });
  }
  if (!ctx.application.ssnBackEnc || !ctx.application.accountNoEnc || !ctx.application.signaturePath) {
    return NextResponse.json({ error: "작성 정보가 부족합니다." }, { status: 400 });
  }
  const signature = await readContractFile(ctx.application.signaturePath);
  if (!signature) return NextResponse.json({ error: "서명 파일을 찾을 수 없습니다." }, { status: 400 });
  const debug = new URL(request.url).searchParams.get("debug") === "coords";
  const pdf = await generateContractPdf({
    application: { ...ctx.application, signedAt: ctx.application.signedAt || new Date().toISOString() },
    ssnFull: `${(ctx.application.certBirthdate || "").slice(2)}${decryptSecret(ctx.application.ssnBackEnc)}`,
    accountNo: decryptSecret(ctx.application.accountNoEnc),
    signaturePng: signature,
    preview: true,
    debug,
  });
  return new NextResponse(new Uint8Array(pdf.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(pdf.fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
