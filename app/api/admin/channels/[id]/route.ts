import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminAccess";
import { buildChannelLandingUrl } from "@/config/channels";
import { setChannelActive } from "@/lib/channelsStore";
import { getSiteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  let body: { active?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (typeof body.active !== "boolean") {
    return NextResponse.json({ error: "활성 여부를 선택해 주세요." }, { status: 400 });
  }
  try {
    const channel = await setChannelActive(id, body.active);
    return NextResponse.json({
      channel: {
        id: channel.id,
        name: channel.label,
        slug: channel.slug,
        orgCode: channel.orgCode,
        active: channel.active,
        url: buildChannelLandingUrl(getSiteUrl(), channel.slug),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "채널을 수정하지 못했습니다.";
    const status = message.includes("찾을 수 없") ? 404 : message.includes("비활성화") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
