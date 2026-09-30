export const MAX_CONSULT_CONTENT = 5000;
export const MAX_CONSULT_REPLY_CHARS = 5000;
export const MAX_CONSULT_NAME = 40;

export type ConsultationReply = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
};

export type Consultation = {
  id: string;
  name: string;
  birthdate: string;
  phone: string;
  content: string;
  replies: ConsultationReply[];
  createdAt: string;
};

export type ConsultationAccess = {
  isAdmin: boolean;
  ownedIds: string[];
};

export type ConsultationSummary = {
  id: string;
  title: string;
  name: string;
  birthdate: string;
  phone: string;
  secret: boolean;
  canView: boolean;
  replyCount: number;
  answered: boolean;
  createdAt: string;
};

export function normalizeConsultPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatConsultPhone(value: string) {
  const digits = normalizeConsultPhone(value);
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return value.trim();
}

export function formatConsultBirthdate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.replace(/-/g, ".");
  return value;
}

export function consultListTitle(content: string) {
  const text = content.trim().replace(/\s+/g, " ");
  if (!text) return "상담신청";
  return text.length > 36 ? `${text.slice(0, 36)}…` : text;
}

export function validateConsultName(value: string) {
  const name = value.trim();
  if (!name) return "이름을 입력해 주세요.";
  if (name.length > MAX_CONSULT_NAME) return `이름은 ${MAX_CONSULT_NAME}자 이내로 입력해 주세요.`;
  return "";
}

export function validateConsultBirthdate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "생년월일을 입력해 주세요.";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return "생년월일을 다시 확인해 주세요.";
  }
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  if (year < 1900 || date.getTime() > today) return "생년월일을 다시 확인해 주세요.";
  return "";
}

export function validateConsultPhone(value: string) {
  const phone = normalizeConsultPhone(value);
  if (!phone) return "전화번호를 입력해 주세요.";
  if (!/^01[016789]\d{7,8}$/.test(phone)) {
    return "전화번호는 010 등 휴대폰 번호, 숫자만 입력해 주세요.";
  }
  return "";
}

export function validateConsultContent(value: string) {
  const content = value.trim();
  if (!content) return "상담 내용을 입력해 주세요.";
  if (content.length > MAX_CONSULT_CONTENT) return "상담 내용은 5,000자 이내로 입력해 주세요.";
  return "";
}

export function normalizeStoredConsultation(item: Consultation): Consultation {
  return {
    ...item,
    name: item.name || "",
    birthdate: item.birthdate || "",
    phone: item.phone || "",
    content: item.content || "",
    replies: Array.isArray(item.replies) ? item.replies : [],
  };
}

export function canViewConsultation(item: Consultation, access: ConsultationAccess | null) {
  if (!access) return false;
  if (access.isAdmin) return true;
  return access.ownedIds.includes(item.id);
}

export function canManageConsultation(item: Consultation, access: ConsultationAccess | null) {
  if (!access) return false;
  return access.ownedIds.includes(item.id);
}

export function canDeleteConsultation(item: Consultation, access: ConsultationAccess | null) {
  if (!access) return false;
  if (access.isAdmin) return true;
  return access.ownedIds.includes(item.id);
}

export function toPublicConsultation(item: Consultation, access: ConsultationAccess | null): Consultation {
  if (access?.isAdmin || canViewConsultation(item, access)) return item;
  return {
    ...item,
    name: "",
    birthdate: "",
    phone: "",
    content: "",
    replies: [],
  };
}

export function toConsultationSummary(item: Consultation, access: ConsultationAccess | null): ConsultationSummary {
  const canView = canViewConsultation(item, access);
  return {
    id: item.id,
    title: canView ? consultListTitle(item.content) : "비밀글입니다",
    name: canView ? item.name : "신청자",
    birthdate: access?.isAdmin ? item.birthdate : "",
    phone: access?.isAdmin ? item.phone : "",
    secret: true,
    canView,
    replyCount: item.replies.length,
    answered: item.replies.length > 0,
    createdAt: item.createdAt,
  };
}

export function parseConsultReplyContent(raw: unknown) {
  const content = String(raw || "").trim();
  if (!content) return { error: "답변 내용을 입력해 주세요." };
  if (content.length > MAX_CONSULT_REPLY_CHARS) {
    return { error: "답변은 5,000자 이내로 입력해 주세요." };
  }
  return { content };
}
