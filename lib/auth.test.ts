import { describe, expect, it } from "vitest";
import { formatPhoneDisplay, validatePhone } from "./auth";

describe("formatPhoneDisplay", () => {
  it("11자리 휴대폰을 하이픈 형식으로 만든다", () => {
    expect(formatPhoneDisplay("01012345678")).toBe("010-1234-5678");
    expect(formatPhoneDisplay("010-1234-5678")).toBe("010-1234-5678");
  });
});

describe("validatePhone", () => {
  it("010은 11자리만 받는다", () => {
    expect(validatePhone("01012345678")).toBe("");
    expect(validatePhone("010-1234-5678")).toBe("");
    expect(validatePhone("0101234567")).toBe("010 번호는 11자리로 입력해 주세요.");
    expect(validatePhone("010123456789")).toBe("010 번호는 11자리로 입력해 주세요.");
  });

  it("그 외 휴대폰 번호는 10~11자리를 받는다", () => {
    expect(validatePhone("0111234567")).toBe("");
    expect(validatePhone("01612345678")).toBe("");
    expect(validatePhone("021234567")).toBe("전화번호는 010 등 휴대폰 번호, 숫자만 입력해 주세요.");
  });
});
