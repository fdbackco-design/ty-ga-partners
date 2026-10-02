import { describe, expect, it } from "vitest";
import { classifyIssueFail, issueFailCopy } from "./failReason";

describe("classifyIssueFail", () => {
  it("전산 아이디 중복과 이미 발급·중복을 구분한다", () => {
    expect(classifyIssueFail({ code: -7001, message: "" })).toBe("emp_id_duplicate");
    expect(classifyIssueFail({ code: -7000, message: "" })).toBe("emp_id_duplicate");
    expect(classifyIssueFail({ code: null, message: "이미 코드가 발급된 아이디입니다." })).toBe("emp_id_duplicate");
    expect(classifyIssueFail({ message: "이미 사원코드가 발급된 분입니다." })).toBe("emp_id_duplicate");
    expect(classifyIssueFail({ message: "이미 등록된 사원입니다." })).toBe("already_issued");
  });

  it("인자 오류·정보 불일치는 mismatch 이다", () => {
    expect(classifyIssueFail({ code: -1000, message: "인자가 잘못되었습니다." })).toBe("mismatch");
    expect(classifyIssueFail({ message: "성명이 본인인증 결과와 일치하지 않습니다." })).toBe("mismatch");
  });

  it("그 외는 일반 실패이다", () => {
    expect(classifyIssueFail({ code: null, message: null })).toBe("failed");
    expect(classifyIssueFail({ code: -1, message: "처리 실패" })).toBe("failed");
  });
});

describe("issueFailCopy", () => {
  it("이미 발급된 분은 재신청 대신 로그인 안내를 한다", () => {
    const copy = issueFailCopy("already_issued");
    expect(copy.retry).toBe(false);
    expect(copy.title).toContain("이미 사원코드가 발급");
    expect(copy.hint).toContain("아이디로 로그인");
  });

  it("정보 불일치는 입력 확인 안내를 한다", () => {
    const copy = issueFailCopy("mismatch");
    expect(copy.retry).toBe(true);
    expect(copy.hint).toContain("성명·주민번호·휴대폰");
  });
});
