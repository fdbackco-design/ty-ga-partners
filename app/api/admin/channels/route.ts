import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminAccess";
import { buildChannelLandingUrl } from "@/config/channels";
import { createChannel, listChannels } from "@/lib/channelsStore";
import { getSiteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";

function withUrl(channel: Awaited<ReturnType<typeof listChannels>>[number]) {
  return {
    id: channel.id,
    name: channel.label,
    slug: channel.slug,
    orgCode: channel.orgCode,
    active: channel.active,
    url: buildChannelLandingUrl(getSiteUrl(), channel.slug),
  };
}

function publicError(error: unknown) {
  const message = error instanceof Error ? error.message : "채널 작업을 완료하지 못했습니다.";
  if (message.includes("ga_channels") || message.includes("schema cache")) {
    return "채널 테이블이 없습니다. Supabase에 채널 마이그레이션을 적용해 주세요.";
  }
  return message;
}

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  try {
    const channels = await listChannels();
    return NextResponse.json({ channels: channels.map(withUrl) });
  } catch (error) {
    return NextResponse.json({ error: publicError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  let body: { name?: string; slug?: string; active?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  try {
    const channel = await createChannel({
      name: String(body.name || ""),
      slug: String(body.slug || ""),
      active: body.active !== false,
    });
    return NextResponse.json({ channel: withUrl(channel) }, { status: 201 });
  } catch (error) {
    const message = publicError(error);
    const status = message.includes("이미 사용 중") ? 409 : message.includes("입력") || message.includes("파라미터") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
