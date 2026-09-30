import { describe, expect, it } from "vitest";
import { alreadyIssuedLoginMessage, maskUsername } from "./partnerCert";

describe("maskUsername", () => {
  it("앞 4자·뒤 2자를 남기고 가운데를 가린다", () => {
    expect(maskUsername("yongho22")).toBe("yong****22");
    expect(maskUsername("yong22")).toBe("yong****22");
  });

  it("짧은 아이디도 일부를 가린다", () => {
    expect(maskUsername("abcd")).toBe("a****d");
    expect(maskUsername("ab")).toBe("a****");
  });
});

describe("alreadyIssuedLoginMessage", () => {
  it("기존 아이디를 가려서 안내한다", () => {
    expect(alreadyIssuedLoginMessage("yongho22")).toBe(
      "이미 코드가 발급된 분입니다. yong****22 아이디로 로그인해 주세요.",
    );
  });

  it("아이디가 없으면 기본 문구만 반환한다", () => {
    expect(alreadyIssuedLoginMessage()).toBe("이미 코드가 발급된 분입니다.");
  });
});
