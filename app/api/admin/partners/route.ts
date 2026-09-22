import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminAccess";
import { listApplications } from "@/lib/partnerApplicationsStore";
import { findUsersByIds } from "@/lib/usersStore";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const applications = await listApplications({
    status: url.searchParams.get("status") || undefined,
    channel: url.searchParams.get("channel") || undefined,
    q: url.searchParams.get("q") || undefined,
    from: url.searchParams.get("from") || undefined,
    to: url.searchParams.get("to") || undefined,
    manualOnly: url.searchParams.get("manual") === "1",
  });
  const users = await findUsersByIds(applications.map((item) => item.userId));
  const userMap = new Map(users.map((user) => [user.id, user]));
  return NextResponse.json({
    applications: applications.map((item) => ({
      id: item.id,
      status: item.status,
      name: item.certName,
      empId: item.empId || userMap.get(item.userId)?.username || "",
      empCode: item.empCode,
      orgCode: item.orgCode,
      joinChannel: item.joinChannel,
      channelSlug: item.channelSlug,
      issuedAt: item.issuedAt,
      signedAt: item.signedAt,
      updatedAt: item.updatedAt,
      lastErrorMessage: item.lastErrorMessage,
    })),
  });
}
