import { isValidOrgCode, JOIN_CHANNEL_MAX, normalizeChannelSlug } from "@/config/channels";
import { isValidSsnChecksum, maskAccount, maskBankSsn2 } from "@/lib/contract/validate";
import { partnerDocSystemQueryKey } from "@/lib/partnerDocAuth";
import { getAppUrl } from "@/lib/siteUrl";
import type { PartnerApplication } from "@/lib/partnerApplication";
import { maskPhone } from "@/lib/partnerCert";
import { toApiSsn2 } from "@/utils/ssn";
import { validateEmpId, validateEmpPassword } from "@/lib/auth";
import { findBank } from "@/lib/contract/banks";

export type EmployeePayload = {
  orgCode: string;
  empName: string;
  empId: string;
  empPswd: string;
  empSsn1: string;
  empSsn2: string;
  empMobile: string;
  joinChannel: string;
  docURL: string;
  empZip: string;
  empAddress: string;
  empAddressEtc: string;
  bankCode: string;
  accountNo: string;
  bankSsn1: string;
  bankSsn2: string;
  depositor: string;
};

export type IssueValidation = { ok: true; payload: EmployeePayload } | { ok: false; error: string };

export function issueIdempotencyKey(applicationId: string) {
  return `issue:${applicationId}`;
}

export function maskEmpSsn1(value: string) {
  return value ? "●●●●●●" : "";
}

export function maskEmpSsn2(value: string) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  return `${digits.slice(0, 1)}●●●●●●`;
}

export function auditableEmployeePayload(payload: EmployeePayload) {
  return {
    ...payload,
    empPswd: payload.empPswd ? "●●●●●●" : "",
    empSsn1: maskEmpSsn1(payload.empSsn1),
    empSsn2: maskEmpSsn2(payload.empSsn2),
    empMobile: maskPhone(payload.empMobile),
    accountNo: maskAccount(payload.accountNo),
    bankSsn1: maskEmpSsn1(payload.bankSsn1),
    bankSsn2: payload.bankSsn2,
  };
}

export function buildDocUrl(docToken: string) {
  const url = `${getAppUrl()}/api/partners/doc/${docToken}`;
  const key = partnerDocSystemQueryKey(docToken);
  return key ? `${url}?key=${encodeURIComponent(key)}` : url;
}

export function validateIssueFields(input: {
  application: PartnerApplication;
  empId: string;
  empPswd: string;
  empSsn1: string;
  empSsn2: string;
  accountNo: string;
  issuedEmpIdTaken: boolean;
}): IssueValidation {
  const { application, empSsn1, issuedEmpIdTaken } = input;
  const empName = (application.certName || "").trim();
  if (!empName) return { ok: false, error: "성명이 없습니다." };
  if (empName !== (application.certName || "").trim()) {
    return { ok: false, error: "성명이 본인인증 결과와 일치하지 않습니다." };
  }
  if (!application.orgCode || !isValidOrgCode(application.orgCode)) {
    return { ok: false, error: "소속 조직 코드가 올바르지 않습니다." };
  }
  const empId = input.empId.trim();
  const empIdError = validateEmpId(empId);
  if (empIdError) return { ok: false, error: empIdError };
  if (issuedEmpIdTaken) return { ok: false, error: "TY 전산용 아이디가 중복되었습니다. 수정해주세요." };
  const empPswdError = validateEmpPassword(input.empPswd);
  if (empPswdError) return { ok: false, error: empPswdError };

  if (!/^\d{6}$/.test(empSsn1)) return { ok: false, error: "주민등록번호 앞 6자리가 올바르지 않습니다." };
  const certFront = (application.certBirthdate || "").slice(2);
  if (certFront && certFront !== empSsn1) {
    return { ok: false, error: "주민등록번호 앞자리가 본인인증 결과와 일치하지 않습니다." };
  }

  const genderCode = application.ssnGenderCode || "";
  if (!/^[1-8]$/.test(genderCode)) return { ok: false, error: "주민등록번호 성별코드가 없습니다." };
  const empSsn2 = toApiSsn2(input.empSsn2);
  if (!empSsn2 || empSsn2[0] !== genderCode) {
    return { ok: false, error: "주민등록번호 뒤자리 형식이 올바르지 않습니다." };
  }
  if (!isValidSsnChecksum(empSsn1, empSsn2)) {
    return { ok: false, error: "주민등록번호를 다시 확인해 주세요." };
  }

  const empMobile = (application.certMobile || "").replace(/\D/g, "");
  if (!/^\d{10,11}$/.test(empMobile)) return { ok: false, error: "휴대폰 번호가 올바르지 않습니다." };
  if (empMobile !== (application.certMobile || "").replace(/\D/g, "")) {
    return { ok: false, error: "휴대폰 번호가 본인인증 결과와 일치하지 않습니다." };
  }

  const storedChannel = String(application.channelSlug || "").trim();
  if (storedChannel && storedChannel !== "default" && storedChannel.length > JOIN_CHANNEL_MAX) {
    return { ok: false, error: "가입 경로가 너무 깁니다." };
  }
  const joinChannel = storedChannel ? normalizeChannelSlug(storedChannel) : application.joinChannel || "";
  if (!joinChannel) return { ok: false, error: "가입 경로가 없습니다." };
  if (joinChannel.length > JOIN_CHANNEL_MAX) {
    return { ok: false, error: "가입 경로가 너무 깁니다." };
  }

  if (!application.docToken || application.docRevoked) {
    return { ok: false, error: "계약서 문서가 준비되지 않았습니다." };
  }

  const empZip = String(application.zipCode || "").replace(/\D/g, "");
  const empAddress = String(application.address1 || "").trim();
  const empAddressEtc = String(application.address2 || "").trim();
  if (!/^\d{5,6}$/.test(empZip) || !empAddress || !empAddressEtc) {
    return { ok: false, error: "주소 정보를 다시 확인해 주세요." };
  }

  const bankCode = String(application.bankCode || "").trim();
  if (!findBank(bankCode)) return { ok: false, error: "은행 정보가 올바르지 않습니다." };
  const accountNo = String(input.accountNo || "").replace(/\D/g, "");
  if (!/^\d{8,16}$/.test(accountNo)) return { ok: false, error: "계좌번호를 다시 확인해 주세요." };
  const depositor = String(application.accountHolder || empName).trim();
  if (!depositor) return { ok: false, error: "예금주명이 없습니다." };
  const bankSsn2 = maskBankSsn2(empSsn2);
  if (!/^\d000000$/.test(bankSsn2)) {
    return { ok: false, error: "예금주 주민등록번호를 확인할 수 없습니다." };
  }

  return {
    ok: true,
    payload: {
      orgCode: application.orgCode,
      empName,
      empId,
      empPswd: input.empPswd,
      empSsn1,
      empSsn2,
      empMobile,
      joinChannel,
      docURL: buildDocUrl(application.docToken),
      empZip,
      empAddress,
      empAddressEtc,
      bankCode,
      accountNo,
      bankSsn1: empSsn1,
      bankSsn2,
      depositor,
    },
  };
}
