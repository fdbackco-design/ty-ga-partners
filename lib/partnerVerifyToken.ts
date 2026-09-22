import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { cookieOptions, safeEqual } from "@/lib/admin";

export const VERIFY_COOKIE = "tyga_partner_verified";
export const VERIFY_TTL_MS = 30 * 60 * 1000;

function getSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "tyga-dev-partner-verify";
}

export type VerifySession = {
  userId: string;
  applicationId: string;
};

export function createVerifyToken(session: VerifySession) {
  const exp = Date.now() + VERIFY_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ uid: session.userId, aid: session.applicationId, exp })).toString(
    "base64url",
  );
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyVerifyToken(token: string | undefined): VerifySession | null {
  if (!token) return null;
  const split = token.lastIndexOf(".");
  if (split < 0) return null;
  const payload = token.slice(0, split);
  const sig = token.slice(split + 1);
  const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");
  if (!safeEqual(sig, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      uid?: string;
      aid?: string;
      exp?: number;
    };
    if (!parsed.uid || !parsed.aid || !parsed.exp || parsed.exp < Date.now()) return null;
    return { userId: parsed.uid, applicationId: parsed.aid };
  } catch {
    return null;
  }
}

export async function getVerifySessionFromCookies() {
  const jar = await cookies();
  return verifyVerifyToken(jar.get(VERIFY_COOKIE)?.value);
}

export function verifyCookieOptions() {
  return {
    ...cookieOptions(),
    maxAge: Math.floor(VERIFY_TTL_MS / 1000),
  };
}
