import { describe, expect, it } from "vitest";
import { auditableEmployeePayload, validateIssueFields, type EmployeePayload } from "./payload";
import type { PartnerApplication } from "@/lib/partnerApplication";

const application = {
  id: "11111111-2222-3333-4444-555555555555",
  userId: "user",
  status: "CONTRACT_SIGNED",
  channelSlug: "default",
  orgCode: "611361",
  joinChannel: "GA파트너스",
  certName: "이명진",
  certBirthdate: "19990311",
  certMobile: "01051095537",
  certGender: 0,
  certNational: "0",
  certDi: "di",
  certResponseNo: "MCH",
  certAt: "2026-09-18T00:00:00.000Z",
  ssnGenderCode: "2",
  contractVersion: "HC_v4",
  agreements: [],
  privacyAgreed: true,
  ssnBackEnc: "enc",
  ssnMasked: "990311-2●●●●●●",
  zipCode: "12345",
  address1: "서울",
  address2: "1층",
  bankCode: "004",
  bankName: "KB국민은행",
  accountNoEnc: "enc",
  accountNoMasked: "123456-**-*****",
  accountHolder: "이명진",
  bizRegNo: null,
  signaturePath: "contracts/x/signature.png",
  signatureAt: "2026-09-18T00:00:00.000Z",
  docToken: "a".repeat(32),
  docPath: "contracts/x/signed.pdf",
  docHash: "hash",
  docRevoked: false,
  signedAt: "2026-09-18T00:00:00.000Z",
  idempotencyKey: null,
  empId: null,
  empCode: null,
  orgName: null,
  issuedAt: null,
  issueAttempts: 0,
  lastErrorCode: null,
  lastErrorMessage: null,
  manualCheckNote: null,
  manualResolvedBy: null,
  manualResolvedAt: null,
  createdAt: "2026-09-18T00:00:00.000Z",
  updatedAt: "2026-09-18T00:00:00.000Z",
} satisfies PartnerApplication;

const empSsn2 = "2234561";

function validate(overrides: Partial<Parameters<typeof validateIssueFields>[0]> = {}) {
  return validateIssueFields({
    application,
    empId: "myungjin",
    empSsn1: "990311",
    empSsn2,
    issuedEmpIdTaken: false,
    ...overrides,
  });
}

describe("validateIssueFields", () => {
  it("TY 페이로드에 입력받은 뒷자리 7자리를 하이픈 없이 넣는다", () => {
    const result = validate();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(empSsn2).toHaveLength(7);
    expect(result.payload.empSsn2).toBe("2234561");
    expect(result.payload.empSsn2).not.toContain("-");
    expect(result.payload.empMobile).toBe("01051095537");
    expect(result.payload.orgCode).toBe("611361");
    expect(result.payload.docURL).toMatch(/^https?:\/\/.+\/api\/partners\/doc\/[a-f0-9]{32}$/);
  });

  it("뒷자리가 없으면 실패한다", () => {
    const result = validate({ empSsn2: "" });
    expect(result.ok).toBe(false);
  });

  it("이미 발급된 empId는 호출 전에 막는다", () => {
    const result = validate({ issuedEmpIdTaken: true });
    expect(result.ok).toBe(false);
  });

  it("joinChannel이 21자면 잘라내지 않고 실패한다", () => {
    const result = validate({
      application: { ...application, channelSlug: "a".repeat(21) },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain("가입 경로");
  });

  it("저장된 채널 조직코드를 orgCode로 보낸다", () => {
    const result = validate({
      application: { ...application, orgCode: "123456" },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.orgCode).toBe("123456");
  });

  it("조직코드가 없으면 실패한다", () => {
    const result = validate({
      application: { ...application, orgCode: "GA" },
    });
    expect(result.ok).toBe(false);
  });

  it("저장된 channel 값을 joinChannel로 보낸다", () => {
    const result = validate({
      application: { ...application, channelSlug: "channel2", joinChannel: "GA파트너스" },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.joinChannel).toBe("channel2");
  });

  it("기본 채널 default slug는 channel1로 보낸다", () => {
    const result = validate();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.joinChannel).toBe("channel1");
  });

  it("감사로그용 페이로드는 주민번호 앞·뒤와 휴대폰을 마스킹한다", () => {
    const payload: EmployeePayload = {
      orgCode: "611361",
      empName: "이명진",
      empId: "myungjin",
      empSsn1: "990311",
      empSsn2,
      empMobile: "01051095537",
      joinChannel: "GA파트너스",
      docURL: "https://example.com/api/partners/doc/aa",
    };
    expect(auditableEmployeePayload(payload).empSsn1).toBe("●●●●●●");
    expect(auditableEmployeePayload(payload).empSsn2).toBe("2●●●●●●");
    expect(auditableEmployeePayload(payload).empSsn2).not.toBe(empSsn2);
    expect(auditableEmployeePayload(payload).empMobile).toBe("010-****-5537");
    expect(auditableEmployeePayload(payload).empName).toBe("이명진");
    expect(auditableEmployeePayload(payload).empId).toBe("myungjin");
  });
});
