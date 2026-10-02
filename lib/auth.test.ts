import { describe, expect, it } from "vitest";
import { formatPhoneDisplay, validateEmpId, validateEmpPassword, validatePhone } from "./auth";

describe("formatPhoneDisplay", () => {
  it("11자리 휴대폰을 하이픈 형식으로 만든다", () => {
    expect(formatPhoneDisplay("01012345678")).toBe("010-1234-5678");
    expect(formatPhoneDisplay("010-1234-5678")).toBe("010-1234-5678");
  });
});

describe("validateEmpId", () => {
  it("영문 소문자·숫자 6~16자만 허용한다", () => {
    expect(validateEmpId("")).toBe("전산 아이디를 입력해 주세요.");
    expect(validateEmpId("abc12")).toBe("전산 아이디는 영문 소문자 또는 숫자 6~16자로 입력해 주세요.");
    expect(validateEmpId("abc123")).toBe("");
    expect(validateEmpId("myungjin")).toBe("");
    expect(validateEmpId("ABC123")).toBe("전산 아이디는 영문 소문자 또는 숫자 6~16자로 입력해 주세요.");
    expect(validateEmpId("user_name")).toBe("전산 아이디는 영문 소문자 또는 숫자 6~16자로 입력해 주세요.");
    expect(validateEmpId("a".repeat(17))).toBe("전산 아이디는 영문 소문자 또는 숫자 6~16자로 입력해 주세요.");
  });
});

describe("validateEmpPassword", () => {
  it("전산 비밀번호는 6자 이상이다", () => {
    expect(validateEmpPassword("")).toBe("전산 비밀번호를 입력해 주세요.");
    expect(validateEmpPassword("12345")).toBe("전산 비밀번호는 6자 이상이어야 합니다.");
    expect(validateEmpPassword("123456")).toBe("");
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
