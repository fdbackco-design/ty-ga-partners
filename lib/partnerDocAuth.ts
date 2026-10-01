import { createHmac } from "crypto";
import { getAdminFromCookies, safeEqual } from "@/lib/admin";
import { getSignedInMemberUser } from "@/lib/partnerAccess";

export type PartnerDocVia = "member" | "admin" | "system";

function docSecret() {
  return (
    process.env.PARTNER_DOC_SYSTEM_KEY ||
    process.env.ENCRYPTION_KEY ||
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    ""
  );
}

export function partnerDocSystemQueryKey(token: string) {
  const secret = docSecret();
  if (!secret || !token) return "";
  return createHmac("sha256", secret).update(`partner-doc:${token}`).digest("hex");
}

export function hasValidPartnerDocSystemKey(request: Request, token: string) {
  const expected = partnerDocSystemQueryKey(token);
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("key") || "";
  if (expected && fromQuery && safeEqual(fromQuery, expected)) return true;
  const raw = process.env.PARTNER_DOC_SYSTEM_KEY || "";
  const fromHeader = request.headers.get("x-partner-doc-key") || "";
  return Boolean(raw && fromHeader && safeEqual(fromHeader, raw));
}

export async function authorizePartnerDoc(
  request: Request,
  ownerUserId: string,
  token: string,
): Promise<PartnerDocVia | null> {
  if (hasValidPartnerDocSystemKey(request, token)) return "system";
  if (await getAdminFromCookies()) return "admin";
  const member = await getSignedInMemberUser();
  if (member && member.id === ownerUserId) return "member";
  return null;
}
