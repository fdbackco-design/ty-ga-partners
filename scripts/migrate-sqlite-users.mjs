import { DatabaseSync } from "node:sqlite";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  process.exit(1);
}

const sqlite = new DatabaseSync("data/users.db");
const rows = sqlite
  .prepare(
    "SELECT id, username, password_hash, name, phone, rrn_front, rrn_back_first, created_at FROM users",
  )
  .all();

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

for (const row of rows) {
  const { error } = await supabase.from("ga_users").upsert(
    {
      id: row.id,
      username: row.username,
      username_lower: row.username.toLowerCase(),
      password_hash: row.password_hash,
      name: row.name,
      phone: row.phone,
      rrn_front: row.rrn_front,
      rrn_back_first: row.rrn_back_first,
      created_at: row.created_at,
    },
    { onConflict: "id" },
  );
  if (error) {
    console.error(row.username, error.message);
    process.exit(1);
  }
  console.log("migrated", row.username);
}

console.log(`done: ${rows.length} users`);
