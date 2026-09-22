import { NextResponse } from "next/server";
import { z } from "zod";
import { AGREEMENT_ITEMS } from "@/lib/contract/agreements";
import { getContractApiContext } from "@/lib/contract/apiAuth";
import { CONTRACT_VERSION } from "@/content/contract/hc-v4";
import { patchApplication, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { publicContractDraft } from "@/lib/partnerApplication";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";

export const runtime = "nodejs";

const schema = z.object({
  independent_contractor: z.literal(true),
  sales_compliance: z.literal(true),
  annex_receipt: z.literal(true),
  privacy: z.literal(true),
});

export async function POST(request: Request) {
  const ctx = await getContractApiContext();
  if ("error" in ctx) return ctx.error;
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "필수 동의 항목을 모두 확인해 주세요." }, { status: 400 });
  }
  const ip = clientIp(request);
  const userAgent = clientUserAgent(request);
  const now = new Date().toISOString();
  const agreements = [...AGREEMENT_ITEMS.map((item) => ({ key: item.key, agreedAt: now, ip, userAgent })), { key: "privacy" as const, agreedAt: now, ip, userAgent }];
  const saved = await patchApplication(ctx.application.id, {
    status: ctx.application.status === "VERIFIED" ? "CONTRACT" : ctx.application.status,
    contract_version: CONTRACT_VERSION,
    agreements,
    privacy_agreed: true,
  });
  await writeAuditLog({
    applicationId: saved.id,
    userId: ctx.user.id,
    event: "CONTRACT_SAVE",
    meta: { step: "agreements" },
    ip,
    userAgent,
  });
  return NextResponse.json({ draft: publicContractDraft(saved) });
}
