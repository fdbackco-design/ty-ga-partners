import { describe, expect, it } from "vitest";
import { hasValidPartnerDocSystemKey, partnerDocSystemQueryKey } from "./partnerDocAuth";

describe("partnerDocSystemQueryKey", () => {
  it("같은 토큰이면 같은 키를 만들고, 다른 토큰이면 달라진다", () => {
    const prev = process.env.PARTNER_DOC_SYSTEM_KEY;
    process.env.PARTNER_DOC_SYSTEM_KEY = "test-doc-secret";
    const token = "a".repeat(32);
    const key = partnerDocSystemQueryKey(token);
    expect(key).toHaveLength(64);
    expect(partnerDocSystemQueryKey(token)).toBe(key);
    expect(partnerDocSystemQueryKey("b".repeat(32))).not.toBe(key);
    process.env.PARTNER_DOC_SYSTEM_KEY = prev;
  });
});

describe("hasValidPartnerDocSystemKey", () => {
  it("전산에 넘기는 key 쿼리만 통과한다", () => {
    const prev = process.env.PARTNER_DOC_SYSTEM_KEY;
    process.env.PARTNER_DOC_SYSTEM_KEY = "test-doc-secret";
    const token = "c".repeat(32);
    const key = partnerDocSystemQueryKey(token);
    const ok = hasValidPartnerDocSystemKey(new Request(`https://n.ty-life.co.kr/api/partners/doc/${token}?key=${key}`), token);
    const noKey = hasValidPartnerDocSystemKey(new Request(`https://n.ty-life.co.kr/api/partners/doc/${token}`), token);
    const wrong = hasValidPartnerDocSystemKey(new Request(`https://n.ty-life.co.kr/api/partners/doc/${token}?key=deadbeef`), token);
    expect(ok).toBe(true);
    expect(noKey).toBe(false);
    expect(wrong).toBe(false);
    process.env.PARTNER_DOC_SYSTEM_KEY = prev;
  });

  it("전용 헤더 키도 통과한다", () => {
    const prev = process.env.PARTNER_DOC_SYSTEM_KEY;
    process.env.PARTNER_DOC_SYSTEM_KEY = "header-secret";
    const token = "d".repeat(32);
    const ok = hasValidPartnerDocSystemKey(
      new Request(`https://n.ty-life.co.kr/api/partners/doc/${token}`, {
        headers: { "x-partner-doc-key": "header-secret" },
      }),
      token,
    );
    expect(ok).toBe(true);
    process.env.PARTNER_DOC_SYSTEM_KEY = prev;
  });
});
