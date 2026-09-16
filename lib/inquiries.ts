import type { Viewer } from "@/lib/viewer";
import { formatFileSize, safeFileName } from "@/lib/resources";

export const MAX_INQUIRY_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_INQUIRY_ATTACHMENTS = 8;
export const MAX_INQUIRY_REPLY_CHARS = 5000;
export const BLOCKED_FILE_EXT = /\.(exe|bat|cmd|com|msi|dll|sh|js)$/i;

export type InquiryAttachment = {
  name: string;
  url: string;
  size: number;
  kind: "image" | "file";
};

export type InquiryReply = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
};

export type Inquiry = {
  id: string;
  title: string;
  content: string;
  secret: boolean;
  authorUsername: string;
  authorName: string;
  authorPhone: string;
  attachments: InquiryAttachment[];
  replies: InquiryReply[];
  createdAt: string;
};

export type InquirySummary = {
  id: string;
  title: string;
  authorName: string;
  authorPhone: string;
  secret: boolean;
  canView: boolean;
  replyCount: number;
  answered: boolean;
  createdAt: string;
};

export function normalizeInquiryPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatInquiryPhone(value: string) {
  const digits = normalizeInquiryPhone(value);
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return value.trim();
}

export function normalizeStoredInquiry(item: Inquiry): Inquiry {
  return {
    ...item,
    authorPhone: item.authorPhone || "",
    attachments: Array.isArray(item.attachments) ? item.attachments : [],
    replies: Array.isArray(item.replies) ? item.replies : [],
  };
}

export function canSeeInquiryAuthor(item: Inquiry, viewer: Viewer | null) {
  if (!viewer) return false;
  return viewer.isAdmin || viewer.username === item.authorUsername;
}

export function toPublicInquiry(item: Inquiry, viewer: Viewer | null): Inquiry {
  const authorPhone = item.authorPhone || "";
  if (viewer?.isAdmin) return { ...item, authorPhone };
  const owner = viewer?.username === item.authorUsername;
  return {
    ...item,
    authorUsername: owner ? item.authorUsername : "",
    authorName: owner ? item.authorName : "회원",
    authorPhone: "",
  };
}

export function canViewInquiry(item: Inquiry, viewer: Viewer | null) {
  if (!item.secret) return true;
  if (!viewer) return false;
  if (viewer.isAdmin) return true;
  return viewer.username === item.authorUsername;
}

export function canManageInquiry(item: Inquiry, viewer: Viewer | null) {
  if (!viewer) return false;
  return viewer.username === item.authorUsername;
}

export function parseInquiryReplyContent(raw: unknown) {
  const content = String(raw || "").trim();
  if (!content) return { error: "답변 내용을 입력해 주세요." };
  if (content.length > MAX_INQUIRY_REPLY_CHARS) {
    return { error: "답변은 5,000자 이내로 입력해 주세요." };
  }
  return { content };
}

export function toInquirySummary(item: Inquiry, viewer: Viewer | null): InquirySummary {
  const canView = canViewInquiry(item, viewer);
  const seeAuthor = canSeeInquiryAuthor(item, viewer);
  return {
    id: item.id,
    title: canView ? item.title : "비밀글입니다",
    authorName: seeAuthor ? item.authorName : "회원",
    authorPhone: viewer?.isAdmin ? item.authorPhone || "" : "",
    secret: item.secret,
    canView,
    replyCount: item.replies.length,
    answered: item.replies.length > 0,
    createdAt: item.createdAt,
  };
}

export function attachmentKind(fileName: string, mime?: string): "image" | "file" {
  if (mime?.startsWith("image/")) return "image";
  if (/\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(fileName)) return "image";
  return "file";
}

export function isBlockedFile(name: string) {
  return BLOCKED_FILE_EXT.test(name);
}

export { formatFileSize, safeFileName };
