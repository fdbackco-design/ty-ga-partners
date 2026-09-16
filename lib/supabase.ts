import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type UserRow = {
  id: string;
  username: string;
  username_lower: string;
  password_hash: string;
  name: string;
  phone: string;
  rrn_front: string;
  rrn_back_first: string;
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
          created_at?: string;
        };
        Update: Partial<UserRow>;
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
