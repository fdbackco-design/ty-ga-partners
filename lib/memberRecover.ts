import { createHmac } from "crypto";
import { safeEqual } from "@/lib/admin";
import { niceCertError, niceCertPayloadSchema } from "@/lib/niceCert";
import { digitsOnly } from "@/lib/partnerCert";
import { parseStubIdentity, partnerCertStubEnabled } from "@/lib/partnerCertStub";
import { ssnGenderCode } from "@/utils/ssn";

export const RECOVER_TTL_MS = 15 * 60 * 1000;

export type RecoverIdentity = {
  name: string;
  phone: string;
  rrnFront: string;
  rrnBackFirst: string;
  di: string;
};

export type RecoverAccount = {
  id: string;
  usernameMasked: string;
};

function getSecret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "tyga-dev-member-recover";
}

export function recoverPurpose(raw: unknown): "id" | "password" {
  if (raw && typeof raw === "object" && (raw as { purpose?: unknown }).purpose === "password") {
    return "password";
  }
  return "id";
}

export function parseRecoverCert(raw: unknown): { identity: RecoverIdentity } | { error: string; status: number } {
  if (raw && typeof raw === "object" && (raw as { stub?: unknown }).stub === true) {
    if (!partnerCertStubEnabled()) {
      return { error: "테스트 본인인증을 사용할 수 없습니다.", status: 403 };
    }
    const parsed = parseStubIdentity(raw as { name?: string; phone?: string; ssn?: string });
    if ("error" in parsed) {
      return { error: parsed.error || "본인인증에 실패했습니다.", status: 400 };
    }
    return {
      identity: {
        name: parsed.name,
        phone: parsed.phone,
        rrnFront: parsed.front,
        rrnBackFirst: parsed.genderCode,
        di: parsed.certDi,
      },
    };
  }

  const parsed = niceCertPayloadSchema.safeParse(raw);
  if (!parsed.success) return { error: "인증 결과가 올바르지 않습니다.", status: 400 };
  const certError = niceCertError(parsed.data);
  if (certError) return { error: certError, status: 400 };
  const genderCode = ssnGenderCode(parsed.data.birthdate, parsed.data.gender, parsed.data.nationalinfo);
  return {
    identity: {
      name: parsed.data.name,
      phone: digitsOnly(parsed.data.mobileno),
      rrnFront: parsed.data.birthdate.slice(2),
      rrnBackFirst: genderCode,
      di: parsed.data.di,
    },
  };
}

export function createRecoverToken(userIds: string[]) {
  const ids = [...new Set(userIds.filter(Boolean))];
  const exp = Date.now() + RECOVER_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ ids, exp })).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyRecoverToken(token: string | undefined): { userIds: string[] } | null {
  if (!token) return null;
  const split = token.lastIndexOf(".");
  if (split < 0) return null;
  const payload = token.slice(0, split);
  const sig = token.slice(split + 1);
  const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");
  if (!safeEqual(sig, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      ids?: unknown;
      exp?: number;
    };
    if (!parsed.exp || parsed.exp < Date.now() || !Array.isArray(parsed.ids)) return null;
    const userIds = parsed.ids.filter((id): id is string => typeof id === "string" && Boolean(id));
    return userIds.length ? { userIds } : null;
  } catch {
    return null;
  }
}
