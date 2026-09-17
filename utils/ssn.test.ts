import { describe, expect, it } from "vitest";
import { birthdateFromRrn, ssnGenderCode } from "./ssn";

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
