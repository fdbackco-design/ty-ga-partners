import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ApplicationAuditLogRow, PartnerApplicationRow } from "@/lib/partnerApplication";

export type UserRow = {
  id: string;
  username: string;
  username_lower: string;
  password_hash: string;
  name: string;
  phone: string;
  rrn_front: string;
  rrn_back_first: string;
  channel: string | null;
  created_at: string;
};

type Database = {
  public: {
    Tables: {
      ga_users: {
        Row: UserRow;
        Insert: {
          id?: string;
          username: string;
          username_lower: string;
          password_hash: string;
          name: string;
          phone: string;
          rrn_front: string;
          rrn_back_first: string;
          channel?: string;
          created_at?: string;
        };
        Update: Partial<UserRow>;
        Relationships: [];
      };
      ga_channels: {
        Row: {
          id: string;
          name: string;
          slug: string;
          org_code: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          org_code?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          id: string;
          name: string;
          slug: string;
          org_code: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      partner_applications: {
        Row: PartnerApplicationRow;
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          channel_slug: string;
          org_code: string;
          join_channel: string;
          cert_name?: string | null;
          cert_birthdate?: string | null;
          cert_mobile?: string | null;
          cert_gender?: number | null;
          cert_national?: string | null;
          cert_di?: string | null;
          cert_response_no?: string | null;
          cert_at?: string | null;
          ssn_gender_code?: string | null;
          contract_version?: string | null;
          agreements?: PartnerApplicationRow["agreements"];
          privacy_agreed?: boolean | null;
          ssn_back_enc?: string | null;
          ssn_masked?: string | null;
          zip_code?: string | null;
          address1?: string | null;
          address2?: string | null;
          bank_code?: string | null;
          bank_name?: string | null;
          account_no_enc?: string | null;
          account_no_masked?: string | null;
          account_holder?: string | null;
          biz_reg_no?: string | null;
          signature_path?: string | null;
          signature_at?: string | null;
          doc_token?: string | null;
          doc_path?: string | null;
          doc_hash?: string | null;
          doc_revoked?: boolean | null;
          signed_at?: string | null;
          idempotency_key?: string | null;
          emp_id?: string | null;
          emp_code?: string | null;
          org_name?: string | null;
          issued_at?: string | null;
          issue_attempts?: number | null;
          last_error_code?: number | null;
          last_error_message?: string | null;
          manual_check_note?: string | null;
          manual_resolved_by?: string | null;
          manual_resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<PartnerApplicationRow>;
        Relationships: [];
      };
      application_audit_logs: {
        Row: ApplicationAuditLogRow;
        Insert: {
          id?: string;
          application_id?: string | null;
          user_id?: string | null;
          event: string;
          meta?: Record<string, unknown>;
          ip?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<ApplicationAuditLogRow>;
        Relationships: [];
      };
      ga_user_phone_history: {
        Row: {
          id: string;
          user_id: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phone: string;
          created_at?: string;
        };
        Update: Partial<{
          id: string;
          user_id: string;
          phone: string;
          created_at: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const globalForSupabase = globalThis as unknown as { tygaSupabase?: SupabaseClient<Database> };

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 .env.local에 등록해 주세요.",
    );
  }
  if (!globalForSupabase.tygaSupabase) {
    globalForSupabase.tygaSupabase = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return globalForSupabase.tygaSupabase;
}
