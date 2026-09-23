import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { UserProfile } from "@/lib/auth";
import { getSupabaseAdmin, type UserRow } from "@/lib/supabase";

export type StoredUser = UserProfile & {
  id: string;
  passwordHash: string;
  channel: string;
  createdAt: string;
};

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [algo, salt, hash] = stored.split(":");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function toUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    name: row.name,
    phone: row.phone,
    rrnFront: row.rrn_front,
    rrnBackFirst: row.rrn_back_first,
    channel: row.channel || "",
    createdAt: row.created_at,
  };
}

export function toProfile(user: StoredUser): UserProfile {
  return {
    username: user.username,
    name: user.name,
    phone: user.phone,
    rrnFront: user.rrnFront,
    rrnBackFirst: user.rrnBackFirst,
  };
}

export async function findUserByUsername(username: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ga_users")
    .select("*")
    .eq("username_lower", username.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toUser(data) : null;
}

export async function findUserById(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("ga_users").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toUser(data) : null;
}

export async function findUsersByIds(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return [] as StoredUser[];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("ga_users").select("*").in("id", unique);
  if (error) throw new Error(error.message);
  return (data || []).map(toUser);
}

export async function createUser(input: {
  username: string;
  password: string;
  name: string;
  phone: string;
  rrnFront: string;
  rrnBackFirst: string;
  channel: string;
}) {
  if (await findUserByUsername(input.username)) {
    throw new Error("이미 사용 중인 아이디입니다.");
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ga_users")
    .insert({
      username: input.username.trim(),
      username_lower: input.username.trim().toLowerCase(),
      password_hash: hashPassword(input.password),
      name: input.name.trim(),
      phone: input.phone,
      rrn_front: input.rrnFront,
      rrn_back_first: input.rrnBackFirst,
      channel: input.channel,
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("이미 사용 중인 아이디입니다.");
    throw new Error(error.message);
  }
  return toUser(data);
}

export async function setUserChannel(userId: string, channel: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("ga_users").update({ channel }).eq("id", userId).is("channel", null);
  if (error) throw new Error(error.message);
}

export type PhoneHistoryItem = {
  phone: string;
  changedAt: string;
};

function historyTableMissing(message: string) {
  return message.includes("ga_user_phone_history") || message.includes("schema cache");
}

export async function listPhoneHistory(userId: string): Promise<PhoneHistoryItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ga_user_phone_history")
    .select("phone, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    if (historyTableMissing(error.message)) {
      throw new Error("휴대폰 변경 이력 테이블이 없습니다. Supabase에 마이그레이션을 적용해 주세요.");
    }
    throw new Error(error.message);
  }
  return (data || []).map((row) => ({ phone: row.phone, changedAt: row.created_at }));
}

export async function updateUserPhone(userId: string, currentPhone: string, nextPhone: string) {
  const supabase = getSupabaseAdmin();
  const { error: histError } = await supabase.from("ga_user_phone_history").insert({
    user_id: userId,
    phone: currentPhone,
  });
  if (histError) {
    if (historyTableMissing(histError.message)) {
      throw new Error("휴대폰 변경 이력 테이블이 없습니다. Supabase에 마이그레이션을 적용해 주세요.");
    }
    throw new Error(histError.message);
  }
  const { data, error } = await supabase.from("ga_users").update({ phone: nextPhone }).eq("id", userId).select("*").single();
  if (error) throw new Error(error.message);
  return toUser(data);
}

export async function updateUserPassword(userId: string, currentPassword: string, nextPassword: string) {
  const user = await findUserById(userId);
  if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
    throw new Error("현재 비밀번호가 올바르지 않습니다.");
  }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("ga_users").update({ password_hash: hashPassword(nextPassword) }).eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function authenticateUser(username: string, password: string) {
  const user = await findUserByUsername(username);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return user;
}
