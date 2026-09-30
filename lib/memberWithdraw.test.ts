import { describe, expect, it } from "vitest";
import type { PartnerApplication } from "./partnerApplication";
import { MEMBER_WITHDRAW_BLOCKED, memberWithdrawBlocked } from "./memberWithdraw";

function app(status: PartnerApplication["status"]) {
  return { status } as PartnerApplication;
}

describe("memberWithdrawBlocked", () => {
  it("위촉 체결·사원코드 발급 전에는 탈퇴할 수 있다", () => {
    expect(memberWithdrawBlocked(null)).toBe(false);
    expect(memberWithdrawBlocked(app("DRAFT"))).toBe(false);
    expect(memberWithdrawBlocked(app("VERIFIED"))).toBe(false);
    expect(memberWithdrawBlocked(app("CONTRACT"))).toBe(false);
    expect(memberWithdrawBlocked(app("SIGNING"))).toBe(false);
    expect(memberWithdrawBlocked(app("FAILED"))).toBe(false);
  });

  it("위촉 체결 이후에는 마이페이지 탈퇴를 막는다", () => {
    expect(memberWithdrawBlocked(app("CONTRACT_SIGNED"))).toBe(true);
    expect(memberWithdrawBlocked(app("SUBMITTING"))).toBe(true);
    expect(memberWithdrawBlocked(app("NEEDS_MANUAL_CHECK"))).toBe(true);
    expect(memberWithdrawBlocked(app("ISSUED"))).toBe(true);
    expect(MEMBER_WITHDRAW_BLOCKED).toContain("해촉 신청");
  });
});
