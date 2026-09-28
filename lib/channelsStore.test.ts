import { describe, expect, it } from "vitest";
import { DEFAULT_CHANNEL_SLUG } from "@/config/channels";
import {
  defaultChannelDeleteError,
  defaultChannelUpdateError,
  validateChannelInput,
} from "./channelsStore";

describe("validateChannelInput", () => {
  it("이름과 슬러그를 정리한다", () => {
    expect(validateChannelInput({ name: " 입소문 파트너스 ", slug: "channel2" })).toEqual({
      name: "입소문 파트너스",
      slug: "channel2",
      orgCode: "611361",
    });
    expect(validateChannelInput({ name: "입소문", slug: "channel2", orgCode: " 123456 " })).toEqual({
      name: "입소문",
      slug: "channel2",
      orgCode: "123456",
    });
    expect(validateChannelInput({ name: "입소문", slug: "channel2", orgCode: "abc" })).toEqual({
      error: "조직코드는 숫자 4~12자리로 입력해 주세요.",
    });
  });

  it("잘못된 슬러그는 거절한다", () => {
    expect(validateChannelInput({ name: "채널", slug: "채널2" })).toEqual({
      error: "URL 파라미터는 영문, 숫자, -, _ 1~20자로 입력해 주세요.",
    });
    expect(validateChannelInput({ name: "채널", slug: "default" })).toEqual({
      error: "URL 파라미터는 영문, 숫자, -, _ 1~20자로 입력해 주세요.",
    });
  });
});

describe("default channel guards", () => {
  it("기본 채널은 슬러그 변경·비활성·삭제를 막는다", () => {
    expect(defaultChannelUpdateError(DEFAULT_CHANNEL_SLUG, { slug: "channel2", active: true })).toBe(
      "기본 채널의 URL 파라미터는 바꿀 수 없습니다.",
    );
    expect(defaultChannelUpdateError(DEFAULT_CHANNEL_SLUG, { slug: DEFAULT_CHANNEL_SLUG, active: false })).toBe(
      "기본 채널은 비활성화할 수 없습니다.",
    );
    expect(defaultChannelDeleteError(DEFAULT_CHANNEL_SLUG)).toBe("기본 채널은 삭제할 수 없습니다.");
  });

  it("다른 채널은 이름·슬러그·삭제가 가능하다", () => {
    expect(defaultChannelUpdateError("channel2", { slug: "ipsomun", active: false })).toBeNull();
    expect(defaultChannelDeleteError("channel2")).toBeNull();
  });
});
