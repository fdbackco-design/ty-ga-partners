import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "tyga_admin";

function getSecret() {
  return process.env.ADMIN_PASSWORD || "";
}

export function getAdminCredentials() {
  return {
    username: (process.env.ADMIN_USERNAME || "").trim(),
    password: process.env.ADMIN_PASSWORD || "",
  };
}

export function adminConfigured() {
  const { username, password } = getAdminCredentials();
  return Boolean(username && password);
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function createAdminToken(username: string) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ u: username, exp })).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | undefined) {
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
      exp?: number;
    };
    if (!parsed.u || !parsed.exp || parsed.exp < Date.now()) return null;
    const { username: adminUser } = getAdminCredentials();
    if (!adminUser || parsed.u !== adminUser) return null;
    return parsed.u;
  } catch {
    return null;
  }
}

export async function getAdminFromCookies() {
  if (!adminConfigured()) return null;
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  };
}
