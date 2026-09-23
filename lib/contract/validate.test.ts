import { describe, expect, it } from "vitest";
import {
  formatBizRegNo,
  formatSsn,
  isValidBizRegNo,
  isValidSsnChecksum,
  maskAccount,
  maskSsn,
  stubSsnBack,
} from "./validate";

describe("formatSsn", () => {
  it("앞 6자리 뒤에 하이픈을 넣는다", () => {
    expect(formatSsn("9903112323232")).toBe("990311-2323232");
    expect(formatSsn("990311-2323232")).toBe("990311-2323232");
    expect(formatSsn("9003111234567")).toBe("900311-1234567");
  });
});

describe("maskSsn / maskAccount", () => {
  it("주민번호 마스킹", () => {
    expect(maskSsn("990311", "2234567")).toBe("990311-2●●●●●●");
  });
  it("계좌 마스킹", () => {
    expect(maskAccount("1234567890123")).toBe("123456-**-*****");
  });
});

describe("isValidSsnChecksum", () => {
  it("체크섬이 맞는 번호만 통과한다", () => {
    const front = "990311";
    const back = stubSsnBack(front, "2");
    expect(isValidSsnChecksum(front, back)).toBe(true);
    expect(isValidSsnChecksum(front, `${back.slice(0, 6)}${(Number(back.slice(-1)) + 1) % 10}`)).toBe(false);
  });
});

describe("isValidBizRegNo", () => {
  it("체크섬이 맞는 사업자번호만 통과한다", () => {
    const head = "120810003";
    const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
    const digits = head.split("").map(Number);
    let sum = 0;
    for (let i = 0; i < 9; i += 1) sum += digits[i] * weights[i];
    sum += Math.floor((digits[8] * 5) / 10);
    const check = (10 - (sum % 10)) % 10;
    expect(isValidBizRegNo(`${head}${check}`)).toBe(true);
    expect(isValidBizRegNo(`${head}${(check + 1) % 10}`)).toBe(false);
    expect(formatBizRegNo(`${head}${check}`)).toMatch(/^\d{3}-\d{2}-\d{5}$/);
  });
});
