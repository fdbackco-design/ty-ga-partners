import { NextResponse } from "next/server";
import { publicContractDraft } from "@/lib/partnerApplication";
import { getContractApiContext } from "@/lib/contract/apiAuth";

export const runtime = "nodejs";

export async function GET() {
  const ctx = await getContractApiContext();
  if ("error" in ctx) return ctx.error;
  return NextResponse.json({ draft: publicContractDraft(ctx.application) });
}
