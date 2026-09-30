import { digitsOnly, validateName, validatePhone } from "@/lib/auth";

export const MAX_RELEASE_NAME = 40;
export const MAX_RELEASE_MEMO = 2000;
export const RELEASE_STATUSES = ["RECEIVED", "DONE"] as const;
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

export const RELEASE_STATUS_LABELS: Record<ReleaseStatus, string> = {
  RECEIVED: "접수",
  DONE: "처리완료",
};

export type ReleaseRequest = {
  id: string;
  userId: string | null;
  name: string;
  phone: string;
  memo: string;
  privacyAgreed: boolean;
  status: ReleaseStatus;
  createdAt: string;
  updatedAt: string;
};

export function isGuestRelease(item: { userId?: string | null }) {
  return !item.userId;
}

export function releaseStatusLabel(status: string) {
  return RELEASE_STATUS_LABELS[status as ReleaseStatus] || status;
}

export function parseReleaseInput(input: {
  name?: string;
  phone?: string;
  memo?: string;
  privacyAgreed?: boolean;
}) {
  const name = (input.name || "").trim();
  const phone = digitsOnly(input.phone || "");
  const memo = (input.memo || "").trim();
  if (!name || !phone) return { error: "이름과 연락처를 입력해 주세요." };
  const nameError = validateName(name);
  if (nameError) return { error: nameError };
  if (name.length > MAX_RELEASE_NAME) return { error: "이름은 40자까지 입력할 수 있습니다." };
  const phoneError = validatePhone(phone);
  if (phoneError) return { error: phoneError };
  if (memo.length > MAX_RELEASE_MEMO) return { error: "요청 내용은 2,000자까지 입력할 수 있습니다." };
  if (!input.privacyAgreed) return { error: "개인정보 수집·이용에 동의해 주세요." };
  return { name, phone, memo };
}

export function normalizeStoredRelease(item: ReleaseRequest): ReleaseRequest {
  const status = RELEASE_STATUSES.includes(item.status) ? item.status : "RECEIVED";
  return {
    id: item.id,
    userId: item.userId || null,
    name: item.name || "",
    phone: digitsOnly(item.phone || ""),
    memo: item.memo || "",
    privacyAgreed: Boolean(item.privacyAgreed),
    status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt || item.createdAt,
  };
}
