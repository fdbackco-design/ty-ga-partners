import { NextResponse } from "next/server";
import { z } from "zod";
import { validateEmpId, validateEmpPassword } from "@/lib/auth";
import { getContractApiContext } from "@/lib/contract/apiAuth";
import { encryptSecret } from "@/lib/crypto";
import { contractStepReady } from "@/lib/partnerAccess";
import { publicContractDraft } from "@/lib/partnerApplication";
import { getIssuedApplicationByEmpId, patchApplication, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";

export const runtime = "nodejs";

const schema = z.object({
  empId: z.string().trim().min(6).max(16),
  empPswd: z.string().min(6).max(40).optional(),
});

export async function POST(request: Request) {
  const ctx = await getContractApiContext({ allowSigned: true });
  if ("error" in ctx) return ctx.error;
  if (!ctx.application.signedAt && !contractStepReady(ctx.application, "account")) {
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
    return NextResponse.json({ error: "전산 아이디와 비밀번호를 확인해 주세요." }, { status: 400 });
  }
  const empId = parsed.data.empId.trim();
  const empIdError = validateEmpId(empId);
  if (empIdError) return NextResponse.json({ error: empIdError }, { status: 400 });

  const issuedSameId = await getIssuedApplicationByEmpId(empId);
  if (issuedSameId && issuedSameId.id !== ctx.application.id) {
    return NextResponse.json({ error: "TY 전산용 아이디가 중복되었습니다. 수정해주세요." }, { status: 400 });
  }

  let empPswdEnc = ctx.application.empPswdEnc;
  if (parsed.data.empPswd) {
    const empPswdError = validateEmpPassword(parsed.data.empPswd);
    if (empPswdError) return NextResponse.json({ error: empPswdError }, { status: 400 });
    empPswdEnc = encryptSecret(parsed.data.empPswd);
  } else if (!empPswdEnc) {
    return NextResponse.json({ error: "전산 비밀번호를 6자 이상 입력해 주세요." }, { status: 400 });
  }

  const saved = await patchApplication(ctx.application.id, {
    emp_id: empId,
    emp_pswd_enc: empPswdEnc,
    last_error_code: null,
    last_error_message: null,
  });
  await writeAuditLog({
    applicationId: saved.id,
    userId: ctx.user.id,
    event: "CONTRACT_SAVE",
    meta: { step: "account", empId },
    ip: clientIp(request),
    userAgent: clientUserAgent(request),
  });
  return NextResponse.json({ draft: publicContractDraft(saved) });
}
