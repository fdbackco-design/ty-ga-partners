import { randomBytes } from "crypto";
import { isValidSsnChecksum } from "@/lib/contract/validate";
import { digitsOnly } from "@/lib/partnerCert";
import { birthdateFromRrn } from "@/utils/ssn";

export const CERT_STUB_RESPONSE_NO = "STUB";

export function partnerCertStubEnabled() {
  return process.env.PARTNER_CERT_STUB === "true" && process.env.VERCEL_ENV !== "production";
}

export function isCertStub(responseNo: string | null | undefined) {
  return responseNo === CERT_STUB_RESPONSE_NO;
}

export function parseStubIdentity(input: { name?: string; phone?: string; ssn?: string }) {
  const name = String(input.name || "").trim();
  const phone = digitsOnly(String(input.phone || ""));
  const ssn = digitsOnly(String(input.ssn || ""));
  if (!name) return { error: "이름을 입력해 주세요." };
  if (!/^01[016789]\d{7,8}$/.test(phone)) return { error: "휴대폰 번호를 확인해 주세요." };
  if (!/^\d{13}$/.test(ssn)) return { error: "주민등록번호 13자리를 입력해 주세요." };
  const front = ssn.slice(0, 6);
  const back = ssn.slice(6);
  const genderCode = back[0] || "";
  if (!/^[1-8]$/.test(genderCode)) return { error: "주민등록번호 뒷자리를 확인해 주세요." };
  const month = Number(front.slice(2, 4));
  const day = Number(front.slice(4, 6));
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { error: "주민등록번호 앞자리를 다시 확인해 주세요." };
  }
  if (!isValidSsnChecksum(front, back)) {
    return { error: "주민등록번호를 다시 확인해 주세요." };
  }
  const birthdate = birthdateFromRrn(front, genderCode);
  return {
    name,
    phone,
    front,
    back,
    genderCode,
    birthdate,
    certGender: Number(genderCode) % 2 === 1 ? 1 : 0,
    certNational: ["5", "6", "7", "8"].includes(genderCode) ? "1" : "0",
    certDi: `stub:${randomBytes(12).toString("hex")}`,
  };
}
