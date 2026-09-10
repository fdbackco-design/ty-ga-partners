import type { Viewer } from "@/lib/viewer";
import { formatFileSize, safeFileName } from "@/lib/resources";

export const MAX_INQUIRY_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_INQUIRY_ATTACHMENTS = 8;
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
};

export type Inquiry = {
  id: string;
  title: string;
  content: string;
  secret: boolean;
  authorUsername: string;
  authorName: string;
  attachments: InquiryAttachment[];
  replies: InquiryReply[];
  createdAt: string;
};

export type InquirySummary = {
  id: string;
  title: string;
  authorName: string;
  secret: boolean;
  canView: boolean;
  replyCount: number;
  answered: boolean;
  createdAt: string;
};

export function canViewInquiry(item: Inquiry, viewer: Viewer | null) {
  if (!item.secret) return true;
  if (!viewer) return false;
  if (viewer.isAdmin) return true;
  return viewer.username === item.authorUsername;
}

export function toInquirySummary(item: Inquiry, viewer: Viewer | null): InquirySummary {
  const canView = canViewInquiry(item, viewer);
  return {
    id: item.id,
    title: canView ? item.title : "비밀글입니다",
    authorName: canView ? item.authorName : "비공개",
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
