import { describe, expect, it } from "vitest";
import {
  buildChannelLandingUrl,
  DEFAULT_CHANNEL_SLUG,
  DEFAULT_ORG_CODE,
  normalizeChannelSlug,
  normalizeOrgCode,
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

describe("orgCode", () => {
  it("비우면 기본 조직코드를 쓰고 입력하면 그 값을 쓴다", () => {
    expect(normalizeOrgCode("")).toEqual({ orgCode: DEFAULT_ORG_CODE });
    expect(normalizeOrgCode("  ")).toEqual({ orgCode: DEFAULT_ORG_CODE });
    expect(normalizeOrgCode("123456")).toEqual({ orgCode: "123456" });
    expect(normalizeOrgCode("abc")).toEqual({ error: "조직코드는 숫자 4~12자리로 입력해 주세요." });
  });
});
