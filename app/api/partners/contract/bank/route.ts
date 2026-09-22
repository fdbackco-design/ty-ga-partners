import { NextResponse } from "next/server";
import { z } from "zod";
import { findBank } from "@/lib/contract/banks";
import { getContractApiContext } from "@/lib/contract/apiAuth";
import { encryptSecret } from "@/lib/crypto";
import { formatBizRegNo, isValidBizRegNo, maskAccount } from "@/lib/contract/validate";
import { patchApplication, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { publicContractDraft } from "@/lib/partnerApplication";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";
import { contractStepReady } from "@/lib/partnerAccess";

export const runtime = "nodejs";

const schema = z.object({
  bankCode: z.string().min(2),
  accountNo: z.string().regex(/^\d{8,16}$/).optional(),
  accountHolder: z.string().min(1).max(40),
  holderIsSelf: z.boolean(),
  bizRegNo: z.string().optional(),
});

export async function POST(request: Request) {
  const ctx = await getContractApiContext();
  if ("error" in ctx) return ctx.error;
  if (!contractStepReady(ctx.application, "bank")) {
    return NextResponse.json({ error: "인적사항을 먼저 입력해 주세요." }, { status: 400 });
  }
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "정산 계좌 정보를 확인해 주세요." }, { status: 400 });
  }
  const bank = findBank(parsed.data.bankCode);
  if (!bank) return NextResponse.json({ error: "은행을 목록에서 선택해 주세요." }, { status: 400 });
  const accountNo = parsed.data.accountNo;
  let accountNoEnc = ctx.application.accountNoEnc;
  let accountNoMasked = ctx.application.accountNoMasked;
  if (accountNo) {
    accountNoEnc = encryptSecret(accountNo);
    accountNoMasked = maskAccount(accountNo);
  } else if (!accountNoEnc) {
    return NextResponse.json({ error: "정산 계좌 정보를 확인해 주세요." }, { status: 400 });
  }
  const biz = parsed.data.bizRegNo ? formatBizRegNo(parsed.data.bizRegNo) : "";
  if (biz && !isValidBizRegNo(biz)) {
    return NextResponse.json({ error: "사업자등록번호를 다시 확인해 주세요." }, { status: 400 });
  }
  // TODO(확인필요): 예금주 실명조회(계좌 인증) API 연동 여부 — 오입력 시 수수료 미지급 사고로 이어짐
  const saved = await patchApplication(ctx.application.id, {
    bank_code: bank.code,
    bank_name: bank.name,
    account_no_enc: accountNoEnc,
    account_no_masked: accountNoMasked,
    account_holder: parsed.data.accountHolder.trim(),
    biz_reg_no: biz || null,
  });
  await writeAuditLog({
    applicationId: saved.id,
    userId: ctx.user.id,
    event: "CONTRACT_SAVE",
    meta: { step: "bank", holderIsSelf: parsed.data.holderIsSelf },
    ip: clientIp(request),
    userAgent: clientUserAgent(request),
  });
  return NextResponse.json({ draft: publicContractDraft(saved) });
}
