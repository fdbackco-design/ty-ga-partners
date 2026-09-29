import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminAccess";
import { getReleases } from "@/lib/releasesStore";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const items = await getReleases();
  return NextResponse.json({ items });
}
