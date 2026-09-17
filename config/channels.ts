export const CHANNELS = {
  default: {
    slug: "default",
    orgCode: "611361",
    label: "TY_GA파트너스 채널1",
    joinChannel: "GA파트너스",
  },
  // 예: /partners/apply?ch=abc
  // abc: { slug: 'abc', orgCode: '6113xx', label: 'TY_GA파트너스 채널2', joinChannel: '수탁사A' },
} as const;

export type ChannelSlug = keyof typeof CHANNELS;
export type Channel = (typeof CHANNELS)[ChannelSlug];

export const CHANNEL_COOKIE = "tyga_partner_ch";
export const JOIN_CHANNEL_MAX = 20;

export function isKnownChannelSlug(value: string): value is ChannelSlug {
  return value in CHANNELS;
}

export function resolveChannel(raw: string | null | undefined): {
  channel: Channel;
  missed: boolean;
  requested: string;
} {
  const requested = String(raw || "").trim();
  if (!requested || requested === "default") {
    return { channel: CHANNELS.default, missed: false, requested };
  }
  if (isKnownChannelSlug(requested)) {
    return { channel: CHANNELS[requested], missed: false, requested };
  }
  return { channel: CHANNELS.default, missed: true, requested };
}
