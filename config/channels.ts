export const DEFAULT_CHANNEL_SLUG = "channel1";
export const DEFAULT_ORG_CODE = "611361";
export const CHANNEL_COOKIE = "tyga_partner_ch";
export const JOIN_CHANNEL_MAX = 20;
export const CHANNEL_QUERY = "channel";
export const LEGACY_CHANNEL_QUERY = "ch";

export type Channel = {
  id?: string;
  slug: string;
  orgCode: string;
  label: string;
  joinChannel: string;
  active: boolean;
};

export const DEFAULT_CHANNEL: Channel = {
  slug: DEFAULT_CHANNEL_SLUG,
  orgCode: DEFAULT_ORG_CODE,
  label: "TY_GA파트너스 채널1",
  joinChannel: DEFAULT_CHANNEL_SLUG,
  active: true,
};

/** 정적 기본 채널. 추가 채널은 ga_channels에서 관리한다. */
export const CHANNELS = {
  channel1: DEFAULT_CHANNEL,
  default: DEFAULT_CHANNEL,
} as const;

export type ChannelSlug = keyof typeof CHANNELS;

export function isDefaultChannelSlug(value: string | null | undefined) {
  const slug = String(value || "").trim();
  return !slug || slug === DEFAULT_CHANNEL_SLUG || slug === "default";
}

export function sanitizeChannelSlug(raw: string | null | undefined) {
  const requested = String(raw || "").trim();
  if (!requested || requested === "default") return "";
  if (!/^[a-zA-Z0-9_-]{1,20}$/.test(requested)) return "";
  return requested;
}

export function normalizeChannelSlug(raw: string | null | undefined) {
  if (isDefaultChannelSlug(raw)) return DEFAULT_CHANNEL_SLUG;
  return sanitizeChannelSlug(raw) || DEFAULT_CHANNEL_SLUG;
}

export function requestChannelParam(searchParams: { get(name: string): string | null }) {
  return sanitizeChannelSlug(searchParams.get(CHANNEL_QUERY) || searchParams.get(LEGACY_CHANNEL_QUERY));
}

export function buildChannelLandingUrl(origin: string, slug: string) {
  const base = origin.replace(/\/$/, "") || "http://localhost:3000";
  return `${base}?${CHANNEL_QUERY}=${encodeURIComponent(normalizeChannelSlug(slug))}`;
}

export function channelFromSlug(slug: string, extras?: Partial<Channel>): Channel {
  const normalized = normalizeChannelSlug(slug);
  return {
    ...DEFAULT_CHANNEL,
    ...extras,
    slug: normalized,
    joinChannel: normalized,
    label: extras?.label || (normalized === DEFAULT_CHANNEL_SLUG ? DEFAULT_CHANNEL.label : normalized),
  };
}

export function isKnownChannelSlug(value: string): value is ChannelSlug {
  return value in CHANNELS || value === DEFAULT_CHANNEL_SLUG;
}

export function resolveChannel(raw: string | null | undefined): {
  channel: Channel;
  missed: boolean;
  requested: string;
} {
  const requested = String(raw || "").trim();
  if (!requested || isDefaultChannelSlug(requested)) {
    return { channel: DEFAULT_CHANNEL, missed: false, requested };
  }
  const slug = sanitizeChannelSlug(requested);
  if (!slug) {
    return { channel: DEFAULT_CHANNEL, missed: true, requested };
  }
  if (slug === DEFAULT_CHANNEL_SLUG) {
    return { channel: DEFAULT_CHANNEL, missed: false, requested };
  }
  return { channel: channelFromSlug(slug), missed: false, requested };
}
