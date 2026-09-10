import { NextResponse } from "next/server";
import { getAdminFromCookies, adminConfigured } from "@/lib/admin";
import { usingBlob } from "@/lib/resourcesStore";

export async function GET() {
  const username = await getAdminFromCookies();
  if (!username) {
    return NextResponse.json({ admin: false, configured: adminConfigured() });
  }
  return NextResponse.json({
    admin: true,
    username,
    storage: usingBlob() ? "blob" : "local",
  });
}
