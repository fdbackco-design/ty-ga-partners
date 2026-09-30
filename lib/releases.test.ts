import { describe, expect, it } from "vitest";
import { parseReleaseInput, releaseStatusLabel } from "./releases";

describe("parseReleaseInput", () => {
  it("requires name, phone, and privacy agreement", () => {
    expect(parseReleaseInput({ name: "", phone: "01012345678", privacyAgreed: true }).error).toBe(
      "이름과 연락처를 입력해 주세요.",
    );
    expect(parseReleaseInput({ name: "홍길동", phone: "", privacyAgreed: true }).error).toBe(
      "이름과 연락처를 입력해 주세요.",
    );
    expect(parseReleaseInput({ name: "홍길동", phone: "01012345678", privacyAgreed: false }).error).toBe(
      "개인정보 수집·이용에 동의해 주세요.",
    );
  });

  it("keeps digits and memo", () => {
    expect(parseReleaseInput({ name: " 홍길동 ", phone: "010-1234-5678", memo: " 해촉 ", privacyAgreed: true })).toEqual({
      name: "홍길동",
      phone: "01012345678",
      memo: "해촉",
    });
  });
});

describe("releaseStatusLabel", () => {
  it("returns Korean labels", () => {
    expect(releaseStatusLabel("RECEIVED")).toBe("접수");
    expect(releaseStatusLabel("DONE")).toBe("처리완료");
  });
});
