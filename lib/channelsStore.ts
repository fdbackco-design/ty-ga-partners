import {
  DEFAULT_CHANNEL,
  DEFAULT_CHANNEL_SLUG,
  DEFAULT_ORG_CODE,
  JOIN_CHANNEL_MAX,
  isDefaultChannelSlug,
  normalizeChannelSlug,
  sanitizeChannelSlug,
  type Channel,
} from "@/config/channels";
import { getSupabaseAdmin } from "@/lib/supabase";

type ChannelRow = {
  id: string;
  name: string;
  slug: string;
  org_code: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export function toChannel(row: ChannelRow): Channel {
  return {
    id: row.id,
    slug: row.slug,
    orgCode: row.org_code,
    label: row.name,
    joinChannel: row.slug,
    active: row.active,
  };
}

export function validateChannelInput(input: { name?: string; slug?: string }) {
  const name = String(input.name || "").trim();
  const slug = sanitizeChannelSlug(input.slug);
  if (!name) return { error: "채널명을 입력해 주세요." };
  if (name.length > 80) return { error: "채널명은 80자 이하로 입력해 주세요." };
  if (!slug) return { error: "URL 파라미터는 영문, 숫자, -, _ 1~20자로 입력해 주세요." };
  if (slug === "default") return { error: "이 파라미터는 사용할 수 없습니다." };
  if (slug.length > JOIN_CHANNEL_MAX) return { error: "URL 파라미터가 너무 깁니다." };
  return { name, slug };
}

export async function listChannels() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("ga_channels").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map(toChannel);
}

export async function getDefaultChannel(): Promise<Channel> {
  const found = await findChannelBySlug(DEFAULT_CHANNEL_SLUG, { includeInactive: true });
  return found || DEFAULT_CHANNEL;
}

export async function findChannelBySlug(
  slug: string,
  opts?: { includeInactive?: boolean },
): Promise<Channel | null> {
  const normalized = normalizeChannelSlug(slug);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("ga_channels").select("*").eq("slug", normalized).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return normalized === DEFAULT_CHANNEL_SLUG ? DEFAULT_CHANNEL : null;
  const channel = toChannel(data);
  if (!opts?.includeInactive && !channel.active) return null;
  return channel;
}

export async function resolveActiveChannel(raw: string | null | undefined): Promise<{
  channel: Channel;
  missed: boolean;
  requested: string;
}> {
  const requested = String(raw || "").trim();
  if (!requested || isDefaultChannelSlug(requested)) {
    return { channel: await getDefaultChannel(), missed: false, requested };
  }
  const slug = sanitizeChannelSlug(requested);
  if (!slug) {
    return { channel: await getDefaultChannel(), missed: true, requested };
  }
  const found = await findChannelBySlug(slug);
  if (found) return { channel: found, missed: false, requested };
  return { channel: await getDefaultChannel(), missed: true, requested };
}

export async function resolveStoredChannel(raw: string | null | undefined): Promise<Channel> {
  const slug = normalizeChannelSlug(raw);
  const found = await findChannelBySlug(slug, { includeInactive: true });
  if (found) return found;
  if (slug === DEFAULT_CHANNEL_SLUG) return getDefaultChannel();
  return {
    ...DEFAULT_CHANNEL,
    slug,
    label: slug,
    joinChannel: slug,
    active: false,
  };
}

export async function createChannel(input: { name: string; slug: string; active: boolean }): Promise<Channel> {
  const parsed = validateChannelInput(input);
  if ("error" in parsed) throw new Error(parsed.error);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ga_channels")
    .insert({
      name: parsed.name,
      slug: parsed.slug,
      org_code: DEFAULT_ORG_CODE,
      active: input.active,
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("이미 사용 중인 URL 파라미터입니다.");
    throw new Error(error.message);
  }
  return toChannel(data);
}

export async function setChannelActive(id: string, active: boolean): Promise<Channel> {
  const supabase = getSupabaseAdmin();
  const { data: current, error: currentError } = await supabase.from("ga_channels").select("*").eq("id", id).maybeSingle();
  if (currentError) throw new Error(currentError.message);
  if (!current) throw new Error("채널을 찾을 수 없습니다.");
  if (current.slug === DEFAULT_CHANNEL_SLUG && !active) {
    throw new Error("기본 채널은 비활성화할 수 없습니다.");
  }
  const { data, error } = await supabase
    .from("ga_channels")
    .update({ active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return toChannel(data);
}
