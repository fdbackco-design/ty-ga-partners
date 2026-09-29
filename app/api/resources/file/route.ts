import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getResourceAccess } from "@/lib/resourceAccess";
import { isResourceImageFile, isSafeResourceBlobPath, isSafeResourceFilePath } from "@/lib/resources";
import { getBlobResult } from "@/lib/blobStore";

export const runtime = "nodejs";

function contentTypeFor(pathname: string, blobType?: string | null) {
  if (blobType) return blobType;
  if (/\.(jpe?g|jpg)$/i.test(pathname)) return "image/jpeg";
  if (/\.png$/i.test(pathname)) return "image/png";
  if (/\.gif$/i.test(pathname)) return "image/gif";
  if (/\.webp$/i.test(pathname)) return "image/webp";
  if (/\.bmp$/i.test(pathname)) return "image/bmp";
  if (/\.mp4$/i.test(pathname)) return "video/mp4";
  if (/\.webm$/i.test(pathname)) return "video/webm";
  if (/\.(ogg|ogv)$/i.test(pathname)) return "video/ogg";
  if (/\.mov$/i.test(pathname)) return "video/quicktime";
  if (/\.m4v$/i.test(pathname)) return "video/x-m4v";
  return "application/octet-stream";
}

async function readLocalUpload(pathname: string) {
  const root = path.join(process.cwd(), "public", "uploads", "resources");
  const full = path.resolve(process.cwd(), "public", pathname);
  if (!full.startsWith(root + path.sep) && full !== root) return null;
  try {
    return await readFile(full);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const access = await getResourceAccess();
  if (!access.canView) {
    return NextResponse.json({ error: "로그인 후 자료를 확인할 수 있습니다." }, { status: 401 });
  }

  const pathname = new URL(request.url).searchParams.get("path") || "";
  if (!isSafeResourceFilePath(pathname)) {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  const isImage = isResourceImageFile(pathname);
  if (!isImage && !access.canDownload) {
    return NextResponse.json({ error: "사원 코드 발급 후 다운로드할 수 있습니다." }, { status: 403 });
  }

  let bytes: Buffer | null = null;
  let type = contentTypeFor(pathname);
  if (pathname.startsWith("uploads/resources/")) {
    bytes = await readLocalUpload(pathname);
  } else if (isSafeResourceBlobPath(pathname)) {
    const result = await getBlobResult(pathname);
    if (result?.stream) {
      bytes = Buffer.from(await new Response(result.stream).arrayBuffer());
      type = contentTypeFor(pathname, result.blob.contentType);
    }
  }
  if (!bytes) {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  const inline = type.startsWith("image/") || (access.canDownload && type.startsWith("video/"));
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(pathname.split("/").pop() || "file")}`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
