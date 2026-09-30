import { del, get, put } from "@vercel/blob";

const BLOB_ACCESS = "private" as const;

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
  return put(pathname, body, { ...options, access: BLOB_ACCESS });
}

export async function getBlobResult(pathname: string) {
  try {
    const result = await get(pathname, { access: BLOB_ACCESS, useCache: false });
    if (result?.statusCode === 200 && result.stream) return result;
  } catch {
    // missing blobs are treated as not found
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
