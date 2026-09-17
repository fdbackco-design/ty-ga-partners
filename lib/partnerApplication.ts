export const PARTNER_STATUSES = ["DRAFT", "VERIFIED", "CONTRACT", "ISSUED", "FAILED"] as const;
export type PartnerApplicationStatus = (typeof PARTNER_STATUSES)[number];

export const AUDIT_EVENTS = [
  "CERT_OPENED",
  "CERT_SUCCESS",
  "CERT_MISMATCH",
  "CERT_TIMEOUT",
  "CERT_DUPLICATE_DI",
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
