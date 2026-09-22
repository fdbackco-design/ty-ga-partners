import { describe, expect, it } from "vitest";
import {
  buildChannelLandingUrl,
  DEFAULT_CHANNEL_SLUG,
  normalizeChannelSlug,
  requestChannelParam,
  sanitizeChannelSlug,
} from "./channels";

describe("channel slug", () => {
  it("channel2를 그대로 두고 기본값은 channel1이다", () => {
    expect(sanitizeChannelSlug("channel2")).toBe("channel2");
    expect(normalizeChannelSlug("")).toBe(DEFAULT_CHANNEL_SLUG);
    expect(normalizeChannelSlug("default")).toBe("channel1");
    expect(sanitizeChannelSlug("채널2")).toBe("");
  });

  it("channel 쿼리를 ch보다 우선한다", () => {
    const params = new URLSearchParams("channel=channel2&ch=old");
    expect(requestChannelParam(params)).toBe("channel2");
    expect(requestChannelParam(new URLSearchParams("ch=channel3"))).toBe("channel3");
  });

  it("가입 URL을 ?channel= 형태로 만든다", () => {
    expect(buildChannelLandingUrl("https://tylifepartners.com/", "channel2")).toBe(
      "https://tylifepartners.com?channel=channel2",
    );
  });
});
