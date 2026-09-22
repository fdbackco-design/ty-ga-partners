import { describe, expect, it } from "vitest";
import { classifyTyOutcome, tyApiDryRunEnabled } from "./tyResponse";

describe("tyApiDryRunEnabled", () => {
  it("값이 없으면 false 이다", () => {
    expect(tyApiDryRunEnabled(undefined)).toBe(false);
    expect(tyApiDryRunEnabled("")).toBe(false);
    expect(tyApiDryRunEnabled("false")).toBe(false);
    expect(tyApiDryRunEnabled("true")).toBe(true);
  });
});

describe("classifyTyOutcome", () => {
  it("code 0 이면 empCode를 저장 대상으로 만든다", () => {
    const outcome = classifyTyOutcome({
      ok: true,
      status: 200,
      elapsedMs: 12,
      body: {
        error: { code: 0, message: "" },
        payload: { orgName: "GA파트너스", empName: "이명진", empCode: "TYS260901001", empId: "myungjin" },
        data: {},
      },
    });
    expect(outcome).toMatchObject({ kind: "issued", empCode: "TYS260901001" });
  });

  it("code -1000 이면 재시도 가능한 실패이다", () => {
    const outcome = classifyTyOutcome({
      ok: true,
      status: 200,
      elapsedMs: 12,
      body: { error: { code: -1000, message: "인자가 잘못되었습니다." }, payload: {}, data: {} },
    });
    expect(outcome.kind).toBe("invalid");
  });

  it("타임아웃과 -9999, 파싱 실패는 수동 확인이다", () => {
    expect(classifyTyOutcome({ ok: false, kind: "timeout", message: "timeout", elapsedMs: 1000 })).toMatchObject({
      kind: "manual",
      reason: "timeout",
    });
    expect(
      classifyTyOutcome({
        ok: true,
        status: 200,
        elapsedMs: 10,
        body: { error: { code: -9999, message: "시스템 에러" }, payload: {}, data: {} },
      }),
    ).toMatchObject({ kind: "manual", reason: "system" });
    expect(classifyTyOutcome({ ok: true, status: 200, elapsedMs: 10, body: "oops" })).toMatchObject({
      kind: "manual",
      reason: "parse",
    });
  });
});
