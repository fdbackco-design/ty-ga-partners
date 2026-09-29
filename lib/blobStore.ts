import { del, get, put } from "@vercel/blob";

type BlobAccess = "public" | "private";

const ACCESS_ORDER: BlobAccess[] = ["private", "public"];

function putOptions(
  access: BlobAccess,
  options: {
    addRandomSuffix?: boolean;
    allowOverwrite?: boolean;
    contentType?: string;
    cacheControlMaxAge?: number;
  },
) {
  return { ...options, access };
}

export async function putBlobFile(
  pathname: string,
  body: Parameters<typeof put>[1],
  options: {
    addRandomSuffix?: boolean;
    allowOverwrite?: boolean;
    contentType?: string;
    cacheControlMaxAge?: number;
  },
) {
  let lastError: unknown;
  for (const access of ACCESS_ORDER) {
    try {
      return await put(pathname, body, putOptions(access, options));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Blob 저장에 실패했습니다.");
}

export async function getBlobResult(pathname: string) {
  for (const access of ACCESS_ORDER) {
    try {
      const result = await get(pathname, { access, useCache: false });
      if (result?.statusCode === 200 && result.stream) return result;
    } catch {
      // store access mode may not match; try the other
    }
  }
  return null;
}

export async function getBlobJson<T>(pathname: string): Promise<T | null> {
  const result = await getBlobResult(pathname);
  if (!result?.stream) return null;
  try {
    return JSON.parse(Buffer.from(await new Response(result.stream).arrayBuffer()).toString("utf8")) as T;
  } catch {
    return null;
  }
}

export async function delBlobFile(pathname: string) {
  try {
    await del(pathname);
  } catch {
    // missing blobs are treated as already deleted
  }
}

export function blobPathnameFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("blob.vercel-storage.com")) return "";
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  } catch {
    return "";
  }
}
