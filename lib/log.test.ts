import { describe, expect, it } from "vitest";
import { redactSecrets } from "./log";

describe("redactSecrets", () => {
  it("주민번호 원문을 마스킹한다", () => {
    expect(redactSecrets("ssn=9903112234567")).toBe("ssn=990311-2●●●●●●");
  });

  it("계좌번호 원문을 마스킹한다", () => {
    expect(redactSecrets("acc=123456789012")).toBe("acc=123456-**-*****");
  });
});
