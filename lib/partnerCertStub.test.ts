import { describe, expect, it } from "vitest";
import { ssnCheckDigit, stubSsnBack } from "@/lib/contract/validate";
import { parseStubIdentity, partnerCertStubEnabled } from "./partnerCertStub";

describe("partnerCertStub", () => {
  it("성별코드와 체크디지트로 테스트 뒷자리를 만든다", () => {
    const back = stubSsnBack("990311", "2");
    expect(back).toHaveLength(7);
    expect(back.startsWith("2")).toBe(true);
    expect(ssnCheckDigit(`990311${back.slice(0, 6)}`)).toBe(back.slice(-1));
  });

  it("13자리 테스트 신원을 파싱한다", () => {
    const back = stubSsnBack("990311", "2");
    const parsed = parseStubIdentity({
      name: "테스트",
      phone: "01012345678",
      ssn: `990311${back}`,
    });
    if ("error" in parsed) throw new Error(parsed.error);
    expect(parsed.birthdate).toBe("19990311");
    expect(parsed.genderCode).toBe("2");
    expect(parsed.certGender).toBe(0);
    expect(parsed.certNational).toBe("0");
    expect(parsed.certDi.startsWith("stub:")).toBe(true);
  });

  it("체크섬이 틀린 주민번호는 거절한다", () => {
    const back = stubSsnBack("990311", "2");
    const bad = `${back.slice(0, 6)}${(Number(back.slice(-1)) + 1) % 10}`;
    const parsed = parseStubIdentity({
      name: "테스트",
      phone: "01012345678",
      ssn: `990311${bad}`,
    });
    expect(parsed).toEqual({ error: "주민등록번호를 다시 확인해 주세요." });
  });

  it("로컬에서만 켜지고 운영에서는 꺼진다", () => {
    const prevStub = process.env.PARTNER_CERT_STUB;
    const prevEnv = process.env.VERCEL_ENV;
    process.env.PARTNER_CERT_STUB = "true";
    delete process.env.VERCEL_ENV;
    expect(partnerCertStubEnabled()).toBe(true);
    process.env.VERCEL_ENV = "production";
    expect(partnerCertStubEnabled()).toBe(false);
    process.env.PARTNER_CERT_STUB = prevStub;
    if (prevEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = prevEnv;
  });
});
