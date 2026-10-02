import { describe, expect, it } from "vitest";
import type { PartnerApplication } from "./partnerApplication";
import { contractDocHref, memberPartnerSummary } from "./partnerApplication";

function app(status: PartnerApplication["status"], extra: Partial<PartnerApplication> = {}) {
  return { status, empCode: "TYS260101001", docToken: "a".repeat(32), docRevoked: false, ...extra } as PartnerApplication;
}

describe("memberPartnerSummary", () => {
  it("신청이 없으면 미신청으로 둔다", () => {
    expect(memberPartnerSummary(null, "hong")).toMatchObject({
      issued: false,
      status: null,
      statusLabel: "미신청",
      empId: "hong",
      empCode: null,
      docToken: null,
    });
  });

  it("발급 완료면 사원코드와 계약서 토큰을 연다", () => {
    const summary = memberPartnerSummary(app("ISSUED", { empId: "tylogin" }), "hong");
    expect(summary.issued).toBe(true);
    expect(summary.statusLabel).toBe("발급 완료");
    expect(summary.empId).toBe("tylogin");
    expect(summary.empCode).toBe("TYS260101001");
    expect(summary.docToken).toHaveLength(32);
    expect(contractDocHref(summary.docToken || "", "view")).toContain("?view=1");
    expect(contractDocHref(summary.docToken || "")).not.toContain("key=");
  });

  it("발급 전이면 사원코드를 숨긴다", () => {
    const summary = memberPartnerSummary(app("CONTRACT_SIGNED"), "hong");
    expect(summary.issued).toBe(false);
    expect(summary.empCode).toBeNull();
    expect(summary.statusLabel).toBe("계약 완료");
  });
});
