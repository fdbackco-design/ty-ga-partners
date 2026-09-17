import { JOIN_CHANNEL_MAX, type Channel } from "@/config/channels";
import {
  toApplication,
  type AuditEvent,
  type PartnerApplication,
} from "@/lib/partnerApplication";
import { getSupabaseAdmin } from "@/lib/supabase";

const CERT_ATTEMPT_EVENTS: AuditEvent[] = ["CERT_OPENED", "CERT_SUCCESS", "CERT_MISMATCH", "CERT_DUPLICATE_DI"];

export async function getApplicationByUserId(userId: string): Promise<PartnerApplication | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("partner_applications").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toApplication(data) : null;
}

export async function getApplicationByDi(di: string): Promise<PartnerApplication | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("partner_applications").select("*").eq("cert_di", di).maybeSingle();
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
  id: string,
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
      status: "VERIFIED",
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
    .eq("id", id)
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

export function isVerifiedOrLater(application: PartnerApplication | null) {
  return Boolean(application && (application.status === "VERIFIED" || application.status === "CONTRACT" || application.status === "ISSUED"));
}
