import { writeFile } from "fs/promises";
import { describe, expect, it } from "vitest";
import { generateContractPdf } from "./pdf";
import type { PartnerApplication } from "@/lib/partnerApplication";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const application = {
  id: "11111111-2222-3333-4444-555555555555",
  userId: "user",
  status: "CONTRACT",
  channelSlug: "default",
  orgCode: "ORG",
  joinChannel: "CH",
  certName: "홍길동",
  certBirthdate: "19900311",
  certMobile: "01012345678",
  certGender: 1,
  certNational: "0",
  certDi: "di",
  certResponseNo: "MCH417TEST",
  certAt: "2026-09-17T08:20:10.000Z",
  ssnGenderCode: "1",
  contractVersion: "HC_v4",
  agreements: [
    { key: "independent_contractor", agreedAt: "2026-09-17T08:22:31.000Z", ip: "1.1.1.1", userAgent: "test" },
    { key: "sales_compliance", agreedAt: "2026-09-17T08:22:33.000Z", ip: "1.1.1.1", userAgent: "test" },
    { key: "annex_receipt", agreedAt: "2026-09-17T08:22:35.000Z", ip: "1.1.1.1", userAgent: "test" },
    { key: "privacy", agreedAt: "2026-09-17T08:22:40.000Z", ip: "1.1.1.1", userAgent: "test" },
  ],
  privacyAgreed: true,
  ssnBackEnc: null,
  ssnMasked: "900311-1●●●●●●",
  zipCode: "12345",
  address1: "서울시 중구",
  address2: "1층",
  bankCode: "004",
  bankName: "KB국민은행",
  accountNoEnc: null,
  accountNoMasked: "123456-**-*****",
  accountHolder: "홍길동",
  bizRegNo: null,
  signaturePath: "contracts/x/signature.png",
  signatureAt: "2026-09-17T08:25:02.000Z",
  docToken: null,
  docPath: null,
  docHash: null,
  docRevoked: false,
  signedAt: "2026-09-17T08:26:00.000Z",
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
  createdAt: "2026-09-17T08:00:00.000Z",
  updatedAt: "2026-09-17T08:26:00.000Z",
} satisfies PartnerApplication;

describe("generateContractPdf", () => {
  it("원본 20페이지 뒤에 이력 페이지를 붙이고 해시를 남긴다", async () => {
    const pdf = await generateContractPdf({
      application,
      ssnFull: "9003111234567",
      accountNo: "1234567890123",
      signaturePng: PNG,
      ip: "203.0.113.10",
      userAgent: "vitest",
    });
    expect(pdf.bytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.bodyHash).toHaveLength(64);
    expect(pdf.fullHash).toHaveLength(64);
    expect(pdf.fullHash).not.toBe(pdf.bodyHash);
    expect(pdf.fileName).toContain("홍길동");
    expect(pdf.fileName).toContain("11111111");
    const { writeFile: writeTmp, mkdtemp } = await import("fs/promises");
    const { tmpdir } = await import("os");
    const { execFileSync } = await import("child_process");
    const { join } = await import("path");
    const dir = await mkdtemp(join(tmpdir(), "tyga-pdf-"));
    const file = join(dir, "out.pdf");
    await writeTmp(file, pdf.bytes);
    const text = execFileSync("pdftotext", ["-f", "10", "-l", "20", file, "-"], { encoding: "utf8" });
    expect(text).toContain("900311-1234567");
    expect(text).not.toContain("9003111234567");
    if (process.env.WRITE_DEBUG_PDF) {
      const debugPdf = await generateContractPdf({
        application,
        ssnFull: "9003111234567",
        accountNo: "1234567890123",
        signaturePng: PNG,
        debug: true,
        ip: "203.0.113.10",
        userAgent: "vitest",
      });
      await writeFile("/tmp/tyga-contract-debug.pdf", debugPdf.bytes);
    }
  }, 20_000);

  it("미리보기는 저장용 해시 없이 워터마크만 넣는다", async () => {
    const pdf = await generateContractPdf({
      application,
      ssnFull: "9003111234567",
      accountNo: "1234567890123",
      signaturePng: PNG,
      preview: true,
    });
    expect(pdf.bodyHash).toBe("");
    expect(pdf.fileName).toContain("미리보기");
  }, 20_000);
});
