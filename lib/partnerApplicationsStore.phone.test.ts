import { describe, expect, it } from "vitest";
import type { PartnerApplication } from "./partnerApplication";
import { phoneChangeLocked } from "./partnerApplicationsStore";

function app(status: PartnerApplication["status"]) {
  return { status } as PartnerApplication;
}

describe("phoneChangeLocked", () => {
  it("사원 등록 전엔 열고 발급 이후엔 잠근다", () => {
    expect(phoneChangeLocked(null)).toBe(false);
    expect(phoneChangeLocked(app("DRAFT"))).toBe(false);
    expect(phoneChangeLocked(app("VERIFIED"))).toBe(false);
    expect(phoneChangeLocked(app("CONTRACT"))).toBe(false);
    expect(phoneChangeLocked(app("SIGNING"))).toBe(false);
    expect(phoneChangeLocked(app("FAILED"))).toBe(false);
    expect(phoneChangeLocked(app("CONTRACT_SIGNED"))).toBe(true);
    expect(phoneChangeLocked(app("SUBMITTING"))).toBe(true);
    expect(phoneChangeLocked(app("NEEDS_MANUAL_CHECK"))).toBe(true);
    expect(phoneChangeLocked(app("ISSUED"))).toBe(true);
  });
});
