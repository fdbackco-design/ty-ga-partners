export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export type ResourcePost = {
  id: string;
  title: string;
  content: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
};

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function safeFileName(name: string) {
  const extMatch = name.match(/(\.[a-zA-Z0-9]{1,8})$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "";
  const stem = name.slice(0, Math.max(0, name.length - ext.length));
  const base = stem
    .replace(/[/\\?%*:|"<>()[\]#&+=]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .trim();
  return `${(base || "file").slice(0, 100)}${ext}`;
}

export function encodeResourcePathSegment(name: string) {
  return encodeURIComponent(name).replace(/\(/g, "%28").replace(/\)/g, "%29");
}

const PLAYABLE_VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i;

export function isPlayableVideo(fileName: string, mime?: string) {
  if (mime?.startsWith("video/")) return true;
  return PLAYABLE_VIDEO_EXT.test(fileName);
}

export function videoMimeType(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (ext === "webm") return "video/webm";
  if (ext === "ogg" || ext === "ogv") return "video/ogg";
  if (ext === "mov") return "video/quicktime";
  if (ext === "m4v") return "video/x-m4v";
  return "video/mp4";
}

export const MAX_CONTENT_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_CONTENT_IMAGES = 12;

export function isResourceImageFile(fileName: string, mime?: string) {
  if (mime?.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp|bmp)$/i.test(fileName);
}

export function isAllowedResourceImageSrc(src: string) {
  if (!src || src.startsWith("javascript:") || src.startsWith("data:")) return false;
  if (src.startsWith("/uploads/resources/")) return true;
  try {
    const url = new URL(src);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return url.hostname.endsWith("vercel-storage.com");
  } catch {
    return false;
  }
}

export type ResourceContentPart =
  | { type: "text"; text: string }
  | { type: "image"; src: string; alt: string };

export function parseResourceContent(content: string): ResourceContentPart[] {
  const parts: ResourceContentPart[] = [];
  const startRe = /!\[([^\]]*)\]\(/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = startRe.exec(content))) {
    if (match.index > last) {
      parts.push({ type: "text", text: content.slice(last, match.index) });
    }
    const alt = match[1];
    const urlStart = match.index + match[0].length;
    let depth = 1;
    let urlEnd = -1;
    for (let i = urlStart; i < content.length; i += 1) {
      const ch = content[i];
      if (ch === "(") depth += 1;
      else if (ch === ")") {
        depth -= 1;
        if (depth === 0) {
          urlEnd = i;
          break;
        }
      }
    }
    if (urlEnd < 0) {
      parts.push({ type: "text", text: content.slice(match.index) });
      last = content.length;
      break;
    }
    const src = content.slice(urlStart, urlEnd);
    if (isAllowedResourceImageSrc(src)) {
      parts.push({ type: "image", src, alt });
    }
    last = urlEnd + 1;
    startRe.lastIndex = last;
  }
  if (last < content.length) {
    parts.push({ type: "text", text: content.slice(last) });
  }
  return parts.length ? parts : [{ type: "text", text: content }];
}

export function resourceExcerpt(content: string) {
  return content.replace(/!\[[^\]]*\]\([^)]+\)/g, " ").replace(/\s+/g, " ").trim();
}
