import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminAccess";
import { buildChannelLandingUrl } from "@/config/channels";
import { deleteChannel, updateChannel } from "@/lib/channelsStore";
import { getSiteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function withUrl(channel: Awaited<ReturnType<typeof updateChannel>>) {
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

function errorStatus(message: string) {
  if (message.includes("찾을 수 없")) return 404;
  if (message.includes("이미 사용 중")) return 409;
  if (
    message.includes("입력") ||
    message.includes("파라미터") ||
    message.includes("비활성화") ||
    message.includes("삭제할 수 없") ||
    message.includes("바꿀 수 없") ||
    message.includes("기본 채널") ||
    message.includes("조직코드") ||
    message.includes("조직 코드")
  ) {
    return 400;
  }
  return 500;
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  let body: { name?: string; slug?: string; orgCode?: string; active?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const hasName = typeof body.name === "string";
  const hasSlug = typeof body.slug === "string";
  const hasOrgCode = typeof body.orgCode === "string";
  const hasActive = typeof body.active === "boolean";
  if (!hasName && !hasSlug && !hasOrgCode && !hasActive) {
    return NextResponse.json({ error: "수정할 내용을 입력해 주세요." }, { status: 400 });
  }

  try {
    const channel = await updateChannel(id, {
      name: hasName ? body.name : undefined,
      slug: hasSlug ? body.slug : undefined,
      orgCode: hasOrgCode ? body.orgCode : undefined,
      active: hasActive ? body.active : undefined,
    });
    return NextResponse.json({ channel: withUrl(channel) });
  } catch (error) {
    const message = publicError(error);
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  try {
    await deleteChannel(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = publicError(error);
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}
