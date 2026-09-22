import { NextResponse } from "next/server";
import { z } from "zod";
import { getContractApiContext } from "@/lib/contract/apiAuth";
import { encryptSecret } from "@/lib/crypto";
import { isValidSsnChecksum, maskSsn } from "@/lib/contract/validate";
import { patchApplication, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { publicContractDraft } from "@/lib/partnerApplication";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";
import { contractStepReady } from "@/lib/partnerAccess";

export const runtime = "nodejs";

const schema = z.object({
  ssnBack: z.string().regex(/^\d{7}$/).optional(),
  zipCode: z.string().min(5).max(6),
  address1: z.string().min(3).max(120),
  address2: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  const ctx = await getContractApiContext();
  if ("error" in ctx) return ctx.error;
  if (!contractStepReady(ctx.application, "info")) {
    return NextResponse.json({ error: "계약서 동의를 먼저 완료해 주세요." }, { status: 400 });
  }
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "주소와 주민등록번호 뒷자리 7자리를 확인해 주세요." }, { status: 400 });
  }
  const front = (ctx.application.certBirthdate || "").slice(2);
  let ssnBackEnc = ctx.application.ssnBackEnc;
  let ssnMasked = ctx.application.ssnMasked;
  if (parsed.data.ssnBack) {
    if (parsed.data.ssnBack[0] !== ctx.application.ssnGenderCode) {
      return NextResponse.json({ error: "주민등록번호 뒷자리가 본인인증 정보와 일치하지 않습니다." }, { status: 400 });
    }
    if (!isValidSsnChecksum(front, parsed.data.ssnBack)) {
      return NextResponse.json({ error: "주민등록번호를 다시 확인해 주세요." }, { status: 400 });
    }
    ssnBackEnc = encryptSecret(parsed.data.ssnBack);
    ssnMasked = maskSsn(front, parsed.data.ssnBack);
  } else if (!ssnBackEnc) {
    return NextResponse.json({ error: "주소와 주민등록번호 뒷자리 7자리를 확인해 주세요." }, { status: 400 });
  }
  const saved = await patchApplication(ctx.application.id, {
    ssn_back_enc: ssnBackEnc,
    ssn_masked: ssnMasked,
    zip_code: parsed.data.zipCode,
    address1: parsed.data.address1.trim(),
    address2: parsed.data.address2.trim(),
  });
  await writeAuditLog({
    applicationId: saved.id,
    userId: ctx.user.id,
    event: "CONTRACT_SAVE",
    meta: { step: "info" },
    ip: clientIp(request),
    userAgent: clientUserAgent(request),
  });
  return NextResponse.json({ draft: publicContractDraft(saved) });
}
