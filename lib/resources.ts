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
  const base = name.replace(/[/\\?%*:|"<>]/g, "_").replace(/\s+/g, " ").trim();
  return base.slice(0, 120) || "file";
}
