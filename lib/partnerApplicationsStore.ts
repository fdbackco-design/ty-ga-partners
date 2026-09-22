import { JOIN_CHANNEL_MAX, type Channel } from "@/config/channels";
import {
  statusAfterCertUpdate,
  toApplication,
  type AuditEvent,
  type PartnerApplication,
  type PartnerApplicationStatus,
} from "@/lib/partnerApplication";
import { getSupabaseAdmin } from "@/lib/supabase";

const CERT_ATTEMPT_EVENTS: AuditEvent[] = ["CERT_OPENED", "CERT_SUCCESS", "CERT_MISMATCH", "CERT_DUPLICATE_DI"];

export async function getApplicationByUserId(userId: string): Promise<PartnerApplication | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("partner_applications").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toApplication(data) : null;
}

export async function getIssuedApplicationByDi(di: string): Promise<PartnerApplication | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("partner_applications")
    .select("*")
    .eq("cert_di", di)
    .eq("status", "ISSUED")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toApplication(data) : null;
}

export async function ensureDraftApplication(userId: string, channel: Channel): Promise<PartnerApplication> {
  if (channel.joinChannel.length > JOIN_CHANNEL_MAX) {
    throw new Error("채널 식별값이 올바르지 않습니다.");
  }
  const existing = await getApplicationByUserId(userId);
  if (existing) return existing;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("partner_applications")
    .insert({
      user_id: userId,
      status: "DRAFT",
      channel_slug: channel.slug,
      org_code: channel.orgCode,
      join_channel: channel.joinChannel,
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") {
      const raced = await getApplicationByUserId(userId);
      if (raced) return raced;
    }
    throw new Error(error.message);
  }
  return toApplication(data);
}

export async function saveVerifiedApplication(
  application: PartnerApplication,
  input: {
    certName: string;
    certBirthdate: string;
    certMobile: string;
    certGender: number;
    certNational: string;
    certDi: string;
    certResponseNo: string;
    ssnGenderCode: string;
  },
): Promise<PartnerApplication> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("partner_applications")
    .update({
      status: statusAfterCertUpdate(application.status),
      cert_name: input.certName,
      cert_birthdate: input.certBirthdate,
      cert_mobile: input.certMobile,
      cert_gender: input.certGender,
      cert_national: input.certNational,
      cert_di: input.certDi,
      cert_response_no: input.certResponseNo,
      cert_at: new Date().toISOString(),
      ssn_gender_code: input.ssnGenderCode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", application.id)
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("이미 코드가 발급된 분입니다");
    throw new Error(error.message);
  }
  return toApplication(data);
}

export async function markApplicationFailed(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("partner_applications")
    .update({ status: "FAILED", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function writeAuditLog(input: {
  applicationId?: string | null;
  userId?: string | null;
  event: AuditEvent;
  meta?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("application_audit_logs").insert({
    application_id: input.applicationId ?? null,
    user_id: input.userId ?? null,
    event: input.event,
    meta: input.meta ?? {},
    ip: input.ip ?? null,
    user_agent: input.userAgent ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function countCertAttempts(userId: string, windowMs = 60 * 60 * 1000) {
  const supabase = getSupabaseAdmin();
  const since = new Date(Date.now() - windowMs).toISOString();
  const { count, error } = await supabase
    .from("application_audit_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("event", CERT_ATTEMPT_EVENTS)
    .gte("created_at", since);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export function isIssued(application: PartnerApplication | null) {
  return application?.status === "ISSUED";
}

export function isContractLocked(application: PartnerApplication | null) {
  return Boolean(
    application &&
      (application.status === "CONTRACT_SIGNED" ||
        application.status === "SUBMITTING" ||
        application.status === "NEEDS_MANUAL_CHECK" ||
        application.status === "ISSUED"),
  );
}

export function isResumable(application: PartnerApplication | null) {
  return Boolean(application && (application.status === "VERIFIED" || application.status === "CONTRACT"));
}

export function isVerifiedOrLater(application: PartnerApplication | null) {
  return Boolean(
    application &&
      (application.status === "VERIFIED" ||
        application.status === "CONTRACT" ||
        application.status === "SIGNING" ||
        application.status === "CONTRACT_SIGNED" ||
        application.status === "SUBMITTING" ||
        application.status === "NEEDS_MANUAL_CHECK" ||
        application.status === "ISSUED"),
  );
}

export async function patchApplication(id: string, patch: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("partner_applications")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return toApplication(data);
}

export async function claimSigning(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("partner_applications")
    .update({ status: "SIGNING", updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["VERIFIED", "CONTRACT"])
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toApplication(data) : null;
}

export async function getApplicationByDocToken(token: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("partner_applications").select("*").eq("doc_token", token).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toApplication(data) : null;
}

export async function getIssuedApplicationByEmpId(empId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("partner_applications")
    .select("*")
    .eq("emp_id", empId)
    .eq("status", "ISSUED")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toApplication(data) : null;
}

export async function claimSubmitting(
  id: string,
  fromStatuses: PartnerApplicationStatus[],
  patch: { empId: string; idempotencyKey: string; issueAttempts: number },
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("partner_applications")
    .update({
      status: "SUBMITTING",
      emp_id: patch.empId,
      idempotency_key: patch.idempotencyKey,
      issue_attempts: patch.issueAttempts,
      last_error_code: null,
      last_error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .in("status", fromStatuses)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toApplication(data) : null;
}

export type AdminApplicationFilter = {
  status?: string;
  channel?: string;
  q?: string;
  from?: string;
  to?: string;
  manualOnly?: boolean;
};

export async function listApplications(filter: AdminApplicationFilter) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("partner_applications").select("*").order("updated_at", { ascending: false }).limit(200);
  if (filter.manualOnly) query = query.eq("status", "NEEDS_MANUAL_CHECK");
  else if (filter.status) query = query.eq("status", filter.status);
  if (filter.channel) query = query.eq("channel_slug", filter.channel);
  if (filter.from) query = query.gte("created_at", filter.from);
  if (filter.to) query = query.lte("created_at", filter.to);
  if (filter.q) {
    const q = filter.q.trim().replace(/[%(),]/g, "");
    if (q) query = query.or(`cert_name.ilike.%${q}%,emp_id.ilike.%${q}%,emp_code.ilike.%${q}%`);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map(toApplication);
}

export async function getApplicationById(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("partner_applications").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toApplication(data) : null;
}

export async function listAuditLogs(applicationId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("application_audit_logs")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}
