import { describe, expect, it } from "vitest";
import { birthdateFromRrn, ssnGenderCode, toApiSsn2 } from "./ssn";
import { statusAfterCertUpdate } from "@/lib/partnerApplication";

describe("ssnGenderCode", () => {
  it("1999년생 여성 내국인 → 2", () => {
    expect(ssnGenderCode("19990311", 0, "0")).toBe("2");
  });

  it("2001년생 남성 내국인 → 3", () => {
    expect(ssnGenderCode("20010101", 1, "0")).toBe("3");
  });

  it("1985년생 남성 외국인 → 5", () => {
    expect(ssnGenderCode("19850101", 1, "1")).toBe("5");
  });
});

describe("birthdateFromRrn", () => {
  it("990311 + 1 → 19990311 (1900년대 남성)", () => {
    expect(birthdateFromRrn("990311", "1")).toBe("19990311");
  });

  it("990311 + 2 → 19990311 (1900년대 여성)", () => {
    expect(birthdateFromRrn("990311", "2")).toBe("19990311");
  });

  it("010311 + 3 → 20010311 (2000년대 남성)", () => {
    expect(birthdateFromRrn("010311", "3")).toBe("20010311");
  });

  it("010311 + 4 → 20010311 (2000년대 여성)", () => {
    expect(birthdateFromRrn("010311", "4")).toBe("20010311");
  });

  it("850101 + 5 → 19850101 (1900년대 외국인 남성)", () => {
    expect(birthdateFromRrn("850101", "5")).toBe("19850101");
  });

  it("850101 + 6 → 19850101 (1900년대 외국인 여성)", () => {
    expect(birthdateFromRrn("850101", "6")).toBe("19850101");
  });

  it("010311 + 7 → 20010311 (2000년대 외국인 남성)", () => {
    expect(birthdateFromRrn("010311", "7")).toBe("20010311");
  });

  it("010311 + 8 → 20010311 (2000년대 외국인 여성)", () => {
    expect(birthdateFromRrn("010311", "8")).toBe("20010311");
  });
});

describe("statusAfterCertUpdate", () => {
  it("DRAFT·FAILED는 VERIFIED로 올린다", () => {
    expect(statusAfterCertUpdate("DRAFT")).toBe("VERIFIED");
    expect(statusAfterCertUpdate("FAILED")).toBe("VERIFIED");
    expect(statusAfterCertUpdate("VERIFIED")).toBe("VERIFIED");
  });

  it("CONTRACT·SIGNING·CONTRACT_SIGNED는 재인증해도 유지한다", () => {
    expect(statusAfterCertUpdate("CONTRACT")).toBe("CONTRACT");
    expect(statusAfterCertUpdate("SIGNING")).toBe("SIGNING");
    expect(statusAfterCertUpdate("CONTRACT_SIGNED")).toBe("CONTRACT_SIGNED");
  });

  it("ISSUED는 되돌리지 않는다", () => {
    expect(statusAfterCertUpdate("ISSUED")).toBe("ISSUED");
  });

  it("SUBMITTING·NEEDS_MANUAL_CHECK는 재인증해도 유지한다", () => {
    expect(statusAfterCertUpdate("SUBMITTING")).toBe("SUBMITTING");
    expect(statusAfterCertUpdate("NEEDS_MANUAL_CHECK")).toBe("NEEDS_MANUAL_CHECK");
  });
});

describe("toApiSsn2", () => {
  it("성별코드 1자리 뒤에 0을 채운다", () => {
    expect(toApiSsn2("2")).toBe("2000000");
    expect(toApiSsn2("1")).toBe("1000000");
    expect(toApiSsn2("3")).toBe("3000000");
  });

  it("하이픈이나 전체 주민번호를 만들지 않는다", () => {
    expect(toApiSsn2("2")).not.toContain("-");
    expect(toApiSsn2("2")).toHaveLength(7);
  });
});
