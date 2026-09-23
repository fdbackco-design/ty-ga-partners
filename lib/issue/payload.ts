import { DEFAULT_ORG_CODE, JOIN_CHANNEL_MAX, normalizeChannelSlug } from "@/config/channels";
import { getAppUrl } from "@/lib/siteUrl";
import type { PartnerApplication } from "@/lib/partnerApplication";
import { maskPhone } from "@/lib/partnerCert";
import { toApiSsn2 } from "@/utils/ssn";

export type EmployeePayload = {
  orgCode: string;
  empName: string;
  empId: string;
  empSsn1: string;
  empSsn2: string;
  empMobile: string;
  joinChannel: string;
  docURL: string;
};

export type IssueValidation = { ok: true; payload: EmployeePayload } | { ok: false; error: string };

function orgCodeKnown(orgCode: string) {
  return orgCode === DEFAULT_ORG_CODE;
}

export function issueIdempotencyKey(applicationId: string) {
  return `issue:${applicationId}`;
}

export function maskEmpSsn1(value: string) {
  return value ? "●●●●●●" : "";
}

export function auditableEmployeePayload(payload: EmployeePayload) {
  return {
    ...payload,
    empSsn1: maskEmpSsn1(payload.empSsn1),
    empMobile: maskPhone(payload.empMobile),
  };
}

export function buildDocUrl(docToken: string) {
  return `${getAppUrl()}/api/partners/doc/${docToken}`;
}

export function validateIssueFields(input: {
  application: PartnerApplication;
  empId: string;
  empSsn1: string;
  issuedEmpIdTaken: boolean;
}): IssueValidation {
  const { application, empId, empSsn1, issuedEmpIdTaken } = input;
  const empName = (application.certName || "").trim();
  if (!empName) return { ok: false, error: "성명이 없습니다." };
  if (empName !== (application.certName || "").trim()) {
    return { ok: false, error: "성명이 본인인증 결과와 일치하지 않습니다." };
  }
  if (!application.orgCode || !orgCodeKnown(application.orgCode)) {
    return { ok: false, error: "소속 조직 코드가 올바르지 않습니다." };
  }
  // TODO(확인필요): 테스트 서버에 orgCode 611361 조직이 세팅되어 있는지 TY측 확인 필요
  if (!empId.trim()) return { ok: false, error: "아이디가 없습니다." };
  if (issuedEmpIdTaken) return { ok: false, error: "이미 코드가 발급된 아이디입니다." };

  if (!/^\d{6}$/.test(empSsn1)) return { ok: false, error: "주민등록번호 앞 6자리가 올바르지 않습니다." };
  const certFront = (application.certBirthdate || "").slice(2);
  if (certFront && certFront !== empSsn1) {
    return { ok: false, error: "주민등록번호 앞자리가 본인인증 결과와 일치하지 않습니다." };
  }

  const genderCode = application.ssnGenderCode || "";
  if (!/^[1-8]$/.test(genderCode)) return { ok: false, error: "주민등록번호 성별코드가 없습니다." };
  const empSsn2 = toApiSsn2(genderCode);
  if (!/^\d{7}$/.test(empSsn2) || empSsn2[0] !== genderCode || empSsn2.slice(1) !== "000000") {
    return { ok: false, error: "주민등록번호 뒤자리 형식이 올바르지 않습니다." };
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

  return {
    ok: true,
    payload: {
      orgCode: application.orgCode,
      empName,
      empId: empId.trim(),
      empSsn1,
      empSsn2,
      empMobile,
      joinChannel,
      docURL: buildDocUrl(application.docToken),
    },
  };
}
