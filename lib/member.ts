import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { cookieOptions, safeEqual } from "@/lib/admin";

export const MEMBER_COOKIE = "tyga_member";

function getSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "tyga-dev-member";
}

export type MemberSession = {
  username: string;
  name: string;
  phone: string;
};

export function createMemberToken(member: MemberSession) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({ u: member.username, n: member.name, p: member.phone || "", exp }),
  ).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyMemberToken(token: string | undefined): MemberSession | null {
  if (!token) return null;
  const split = token.lastIndexOf(".");
  if (split < 0) return null;
  const payload = token.slice(0, split);
  const sig = token.slice(split + 1);
  const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");
  if (!safeEqual(sig, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      u?: string;
      n?: string;
      p?: string;
      exp?: number;
    };
    if (!parsed.u || !parsed.n || !parsed.exp || parsed.exp < Date.now()) return null;
    return { username: parsed.u, name: parsed.n, phone: String(parsed.p || "") };
  } catch {
    return null;
  }
}

export async function getMemberFromCookies() {
  const jar = await cookies();
  return verifyMemberToken(jar.get(MEMBER_COOKIE)?.value);
}

export function memberCookieOptions() {
  return cookieOptions();
}

export function memberSessionFromUser(user: { username: string; name: string; phone: string }): MemberSession {
  return { username: user.username, name: user.name, phone: user.phone || "" };
}
