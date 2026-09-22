import type { StoredAgreement } from "@/lib/contract/agreements";

export const PARTNER_STATUSES = [
  "DRAFT",
  "VERIFIED",
  "CONTRACT",
  "SIGNING",
  "CONTRACT_SIGNED",
  "SUBMITTING",
  "ISSUED",
  "FAILED",
  "NEEDS_MANUAL_CHECK",
] as const;
export type PartnerApplicationStatus = (typeof PARTNER_STATUSES)[number];

export const AUDIT_EVENTS = [
  "CERT_OPENED",
  "CERT_SUCCESS",
  "CERT_MISMATCH",
  "CERT_TIMEOUT",
  "CERT_DUPLICATE_DI",
  "CONTRACT_SAVE",
  "CONTRACT_SIGN",
  "CONTRACT_SUBMIT",
  "DOC_ACCESS",
  "ISSUE_REQUESTED",
  "EMP_REQ_SENT",
  "EMP_ISSUED",
  "EMP_FAILED",
  "EMP_TIMEOUT",
  "MANUAL_RESOLVED",
  "ADMIN_VIEW",
  "ADMIN_REVOKE",
  "channel_miss",
  "ERROR",
] as const;
export type AuditEvent = (typeof AUDIT_EVENTS)[number];

export type PartnerApplication = {
  id: string;
  userId: string;
  status: PartnerApplicationStatus;
  channelSlug: string;
  orgCode: string;
  joinChannel: string;
  certName: string | null;
  certBirthdate: string | null;
  certMobile: string | null;
  certGender: number | null;
  certNational: string | null;
  certDi: string | null;
  certResponseNo: string | null;
  certAt: string | null;
  ssnGenderCode: string | null;
  contractVersion: string | null;
  agreements: StoredAgreement[] | null;
  privacyAgreed: boolean;
  ssnBackEnc: string | null;
  ssnMasked: string | null;
  zipCode: string | null;
  address1: string | null;
  address2: string | null;
  bankCode: string | null;
  bankName: string | null;
  accountNoEnc: string | null;
  accountNoMasked: string | null;
  accountHolder: string | null;
  bizRegNo: string | null;
  signaturePath: string | null;
  signatureAt: string | null;
  docToken: string | null;
  docPath: string | null;
  docHash: string | null;
  docRevoked: boolean;
  signedAt: string | null;
  idempotencyKey: string | null;
  empId: string | null;
  empCode: string | null;
  orgName: string | null;
  issuedAt: string | null;
  issueAttempts: number;
  lastErrorCode: number | null;
  lastErrorMessage: string | null;
  manualCheckNote: string | null;
  manualResolvedBy: string | null;
  manualResolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PartnerApplicationRow = {
  id: string;
  user_id: string;
  status: string;
  channel_slug: string;
  org_code: string;
  join_channel: string;
  cert_name: string | null;
  cert_birthdate: string | null;
  cert_mobile: string | null;
  cert_gender: number | null;
  cert_national: string | null;
  cert_di: string | null;
  cert_response_no: string | null;
  cert_at: string | null;
  ssn_gender_code: string | null;
  contract_version: string | null;
  agreements: StoredAgreement[] | null;
  privacy_agreed: boolean | null;
  ssn_back_enc: string | null;
  ssn_masked: string | null;
  zip_code: string | null;
  address1: string | null;
  address2: string | null;
  bank_code: string | null;
  bank_name: string | null;
  account_no_enc: string | null;
  account_no_masked: string | null;
  account_holder: string | null;
  biz_reg_no: string | null;
  signature_path: string | null;
  signature_at: string | null;
  doc_token: string | null;
  doc_path: string | null;
  doc_hash: string | null;
  doc_revoked: boolean | null;
  signed_at: string | null;
  idempotency_key: string | null;
  emp_id: string | null;
  emp_code: string | null;
  org_name: string | null;
  issued_at: string | null;
  issue_attempts: number | null;
  last_error_code: number | null;
  last_error_message: string | null;
  manual_check_note: string | null;
  manual_resolved_by: string | null;
  manual_resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationAuditLogRow = {
  id: string;
  application_id: string | null;
  user_id: string | null;
  event: string;
  meta: Record<string, unknown>;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

export function toApplication(row: PartnerApplicationRow): PartnerApplication {
  return {
    id: row.id,
    userId: row.user_id,
    status: (PARTNER_STATUSES.includes(row.status as PartnerApplicationStatus)
      ? row.status
      : "DRAFT") as PartnerApplicationStatus,
    channelSlug: row.channel_slug,
    orgCode: row.org_code,
    joinChannel: row.join_channel,
    certName: row.cert_name,
    certBirthdate: row.cert_birthdate,
    certMobile: row.cert_mobile,
    certGender: row.cert_gender,
    certNational: row.cert_national,
    certDi: row.cert_di,
    certResponseNo: row.cert_response_no,
    certAt: row.cert_at,
    ssnGenderCode: row.ssn_gender_code,
    contractVersion: row.contract_version,
    agreements: Array.isArray(row.agreements) ? row.agreements : null,
    privacyAgreed: Boolean(row.privacy_agreed),
    ssnBackEnc: row.ssn_back_enc,
    ssnMasked: row.ssn_masked,
    zipCode: row.zip_code,
    address1: row.address1,
    address2: row.address2,
    bankCode: row.bank_code,
    bankName: row.bank_name,
    accountNoEnc: row.account_no_enc,
    accountNoMasked: row.account_no_masked,
    accountHolder: row.account_holder,
    bizRegNo: row.biz_reg_no,
    signaturePath: row.signature_path,
    signatureAt: row.signature_at,
    docToken: row.doc_token,
    docPath: row.doc_path,
    docHash: row.doc_hash,
    docRevoked: Boolean(row.doc_revoked),
    signedAt: row.signed_at,
    idempotencyKey: row.idempotency_key ?? null,
    empId: row.emp_id ?? null,
    empCode: row.emp_code ?? null,
    orgName: row.org_name ?? null,
    issuedAt: row.issued_at ?? null,
    issueAttempts: row.issue_attempts ?? 0,
    lastErrorCode: row.last_error_code ?? null,
    lastErrorMessage: row.last_error_message ?? null,
    manualCheckNote: row.manual_check_note ?? null,
    manualResolvedBy: row.manual_resolved_by ?? null,
    manualResolvedAt: row.manual_resolved_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function statusAfterCertUpdate(current: PartnerApplicationStatus): PartnerApplicationStatus {
  if (
    current === "CONTRACT" ||
    current === "SIGNING" ||
    current === "CONTRACT_SIGNED" ||
    current === "SUBMITTING" ||
    current === "NEEDS_MANUAL_CHECK" ||
    current === "ISSUED"
  ) {
    return current;
  }
  return "VERIFIED";
}

export function isCompleteFlowStatus(status: PartnerApplicationStatus, signedAt?: string | null) {
  if (status === "CONTRACT_SIGNED" || status === "SUBMITTING" || status === "ISSUED" || status === "NEEDS_MANUAL_CHECK") {
    return true;
  }
  return status === "FAILED" && Boolean(signedAt);
}

export function publicContractDraft(application: PartnerApplication) {
  return {
    status: application.status,
    contractVersion: application.contractVersion,
    agreements: application.agreements,
    privacyAgreed: application.privacyAgreed,
    name: application.certName,
    birthdate: application.certBirthdate,
    phone: application.certMobile,
    ssnFront: application.certBirthdate ? application.certBirthdate.slice(2) : "",
    ssnMasked: application.ssnMasked,
    zipCode: application.zipCode,
    address1: application.address1,
    address2: application.address2,
    bankCode: application.bankCode,
    bankName: application.bankName,
    accountNoMasked: application.accountNoMasked,
    accountHolder: application.accountHolder,
    bizRegNo: application.bizRegNo,
    hasSignature: Boolean(application.signaturePath),
    signedAt: application.signedAt,
  };
}

export type PublicContractDraft = ReturnType<typeof publicContractDraft>;

export function publicIssueView(application: PartnerApplication, empId: string, ssnFront?: string) {
  const issued = application.status === "ISSUED";
  return {
    status: application.status,
    name: application.certName,
    empId,
    empCode: issued ? application.empCode : null,
    orgName: application.orgName || application.joinChannel,
    ssnFront: ssnFront || (application.certBirthdate ? application.certBirthdate.slice(2) : ""),
    issuedAt: application.issuedAt,
    docToken: application.docToken && !application.docRevoked ? application.docToken : null,
    canRetry: application.status === "FAILED" && Boolean(application.signedAt),
  };
}

export type PublicIssueView = ReturnType<typeof publicIssueView>;
