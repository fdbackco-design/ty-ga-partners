import { upload, type PutBlobResult } from "@vercel/blob/client";

type BlobAccess = "private" | "public";

const ACCESS_ORDER: BlobAccess[] = ["private", "public"];
const rememberedAccess = new Map<string, BlobAccess>();
const MULTIPART_MIN_BYTES = 4 * 1024 * 1024;

function uploadOptions(handleUploadUrl: string, file: File, access: BlobAccess) {
  return {
    access,
    handleUploadUrl,
    multipart: file.size >= MULTIPART_MIN_BYTES,
  } as const;
}

export async function uploadClientBlob(pathname: string, file: File, handleUploadUrl: string): Promise<PutBlobResult> {
  const known = rememberedAccess.get(handleUploadUrl);
  const order = known ? [known, ...ACCESS_ORDER.filter((access) => access !== known)] : ACCESS_ORDER;
  let lastError: unknown;
  for (const access of order) {
    try {
      const result = await upload(pathname, file, uploadOptions(handleUploadUrl, file, access));
      rememberedAccess.set(handleUploadUrl, access);
      return result;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("업로드에 실패했습니다.");
}
