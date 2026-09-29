export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_RESOURCE_FILES = 8;
export const MAX_RESOURCE_CATEGORY_NAME = 20;

export function mergePickedFiles<T extends { name: string; size: number; lastModified?: number }>(
  current: T[],
  incoming: T[],
  max = MAX_RESOURCE_FILES,
) {
  const next = [...current];
  for (const file of incoming) {
    if (next.length >= max) break;
    if (
      next.some(
        (row) =>
          row.name === file.name &&
          row.size === file.size &&
          (row.lastModified ?? 0) === (file.lastModified ?? 0),
      )
    ) {
      continue;
    }
    next.push(file);
  }
  return next;
}

export type ResourceFile = {
  name: string;
  url: string;
  size: number;
};

export type ResourcePost = {
  id: string;
  title: string;
  content: string;
  category: string;
  files: ResourceFile[];
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
};

export type ResourceCategory = {
  id: string;
  name: string;
  createdAt: string;
};

export function normalizeResourceFiles(item: {
  files?: ResourceFile[];
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
}): ResourceFile[] {
  if (Array.isArray(item.files) && item.files.length) {
    return item.files
      .filter((file) => file && String(file.url || "").trim())
      .slice(0, MAX_RESOURCE_FILES)
      .map((file) => ({
        name: String(file.name || "file"),
        url: String(file.url),
        size: Number(file.size || 0),
      }));
  }
  const url = String(item.fileUrl || "").trim();
  if (!url) return [];
  return [{ name: String(item.fileName || "file"), url, size: Number(item.fileSize || 0) }];
}

export function normalizeStoredResource(item: ResourcePost): ResourcePost {
  const files = normalizeResourceFiles(item);
  return {
    ...item,
    category: String(item.category || "").trim(),
    files,
    fileName: files[0]?.name || "",
    fileUrl: files[0]?.url || "",
    fileSize: files[0]?.size || 0,
  };
}

export function publicResource(item: ResourcePost, canDownload: boolean): ResourcePost {
  const normalized = normalizeStoredResource(item);
  if (canDownload) return normalized;
  return {
    ...normalized,
    files: normalized.files.map((file) => ({ ...file, url: "" })),
    fileUrl: "",
  };
}

export function resourceHasVideo(item: ResourcePost) {
  return normalizeResourceFiles(item).some((file) => isPlayableVideo(file.name));
}

export function fileKindLabel(item: ResourcePost) {
  const files = normalizeResourceFiles(item);
  if (!files.length) return "";
  if (files.some((file) => isPlayableVideo(file.name))) {
    return files.length > 1 ? `영상 외 ${files.length - 1}` : "영상";
  }
  if (files.length > 1) return `첨부 ${files.length}`;
  const ext = files[0].name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return ext || "첨부";
}

export function sanitizeCategoryName(name: string) {
  const trimmed = String(name || "").trim().replace(/\s+/g, " ");
  if (!trimmed || trimmed.length > MAX_RESOURCE_CATEGORY_NAME) return "";
  return trimmed;
}

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

export function resourceBlobPathnameFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("blob.vercel-storage.com")) return "";
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  } catch {
    return "";
  }
}

export function isSafeResourceBlobPath(pathname: string) {
  if (!pathname || pathname.includes("..") || pathname.includes("\\") || pathname.startsWith("/")) return false;
  return pathname.startsWith("resources/");
}

export function isSafeResourceFilePath(pathname: string) {
  if (!pathname || pathname.includes("..") || pathname.includes("\\") || pathname.startsWith("/")) return false;
  return pathname.startsWith("resources/") || pathname.startsWith("uploads/resources/");
}

export function resourceFileSrc(url: string, pathname?: string) {
  if (!url) return url;
  if (url.startsWith("/api/resources/file")) return url;
  if (url.startsWith("/uploads/resources/")) {
    const stored = decodeResourcePath(url.replace(/^\//, ""));
    return `/api/resources/file?path=${encodeURIComponent(stored)}`;
  }
  const path = pathname || resourceBlobPathnameFromUrl(url);
  if (!isSafeResourceBlobPath(path)) return url;
  return `/api/resources/file?path=${encodeURIComponent(path)}`;
}

export function resourceStoredBlobPath(url: string) {
  return resourceStoredFilePath(url);
}

export function resourceStoredFilePath(url: string) {
  if (url.startsWith("/uploads/resources/")) return decodeResourcePath(url.replace(/^\//, ""));
  if (url.startsWith("/api/resources/file")) {
    try {
      return new URL(url, "https://www.ty-ga-partners.com").searchParams.get("path") || "";
    } catch {
      return "";
    }
  }
  return resourceBlobPathnameFromUrl(url);
}

function decodeResourcePath(pathname: string) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

export function isAllowedResourceImageSrc(src: string) {
  if (!src || src.startsWith("javascript:") || src.startsWith("data:")) return false;
  if (src.startsWith("/uploads/resources/")) return true;
  if (src.startsWith("/api/resources/file")) {
    try {
      const path = new URL(src, "https://www.ty-ga-partners.com").searchParams.get("path") || "";
      return isSafeResourceFilePath(path);
    } catch {
      return false;
    }
  }
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
