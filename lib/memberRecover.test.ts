import { afterEach, describe, expect, it } from "vitest";
import { stubSsnBack } from "@/lib/contract/validate";
import { createRecoverToken, parseRecoverCert, recoverPurpose, verifyRecoverToken } from "./memberRecover";

describe("memberRecover token", () => {
  it("서명된 토큰에서 사용자 id를 복원한다", () => {
    const token = createRecoverToken(["user-a", "user-b"]);
    expect(verifyRecoverToken(token)).toEqual({ userIds: ["user-a", "user-b"] });
  });

  it("변조된 토큰은 거절한다", () => {
    const token = createRecoverToken(["user-a"]);
    expect(verifyRecoverToken(`${token}x`)).toBeNull();
    expect(verifyRecoverToken("")).toBeNull();
  });
});

describe("parseRecoverCert", () => {
  const prevStub = process.env.PARTNER_CERT_STUB;
  const prevEnv = process.env.VERCEL_ENV;

  afterEach(() => {
    process.env.PARTNER_CERT_STUB = prevStub;
    if (prevEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = prevEnv;
  });

  it("테스트 본인인증에서 가입 신원 필드를 만든다", () => {
    process.env.PARTNER_CERT_STUB = "true";
    delete process.env.VERCEL_ENV;
    const back = stubSsnBack("990311", "2");
    const parsed = parseRecoverCert({
      stub: true,
      purpose: "password",
      name: "홍길동",
      phone: "01012345678",
      ssn: `990311${back}`,
    });
    if ("error" in parsed) throw new Error(parsed.error);
    expect(parsed.identity).toMatchObject({
      name: "홍길동",
      phone: "01012345678",
      rrnFront: "990311",
      rrnBackFirst: "2",
    });
    expect(parsed.identity.di.startsWith("stub:")).toBe(true);
  });

  it("purpose는 password일 때만 비밀번호 찾기다", () => {
    expect(recoverPurpose({ purpose: "password" })).toBe("password");
    expect(recoverPurpose({ purpose: "id" })).toBe("id");
    expect(recoverPurpose({})).toBe("id");
  });
});
