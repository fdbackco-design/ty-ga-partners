import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { cookieOptions, getAdminFromCookies, safeEqual } from "@/lib/admin";
import type { ConsultationAccess } from "@/lib/consultations";

export const CONSULT_COOKIE = "tyga_consult";
export const CONSULT_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_OWNED_IDS = 40;

function getSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "tyga-dev-consult";
}

export function createConsultToken(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))].slice(-MAX_OWNED_IDS);
  const exp = Date.now() + CONSULT_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ ids: unique, exp })).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyConsultToken(token: string | undefined): string[] {
  if (!token) return [];
  const split = token.lastIndexOf(".");
  if (split < 0) return [];
  const payload = token.slice(0, split);
  const sig = token.slice(split + 1);
  const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");
  if (!safeEqual(sig, expected)) return [];
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      ids?: unknown;
      exp?: number;
    };
    if (!parsed.exp || parsed.exp < Date.now() || !Array.isArray(parsed.ids)) return [];
    return parsed.ids.filter((id): id is string => typeof id === "string" && Boolean(id)).slice(-MAX_OWNED_IDS);
  } catch {
    return [];
  }
}

export async function getConsultOwnedIds() {
  const jar = await cookies();
  return verifyConsultToken(jar.get(CONSULT_COOKIE)?.value);
}

export async function getConsultAccess(): Promise<ConsultationAccess> {
  const admin = await getAdminFromCookies();
  const ownedIds = await getConsultOwnedIds();
  return { isAdmin: Boolean(admin), ownedIds };
}

export function consultCookieOptions() {
  return {
    ...cookieOptions(),
    maxAge: Math.floor(CONSULT_TTL_MS / 1000),
  };
}
