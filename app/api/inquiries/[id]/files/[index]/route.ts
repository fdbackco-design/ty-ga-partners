import { NextResponse } from "next/server";
import { canViewInquiry, type InquiryAttachment } from "@/lib/inquiries";
import { blobPathnameFromUrl, getBlobResult } from "@/lib/blobStore";
import { getInquiry } from "@/lib/inquiriesStore";
import { getViewer } from "@/lib/viewer";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string; index: string }> };

function contentTypeFor(file: InquiryAttachment, blobType?: string | null) {
  if (blobType) return blobType;
  if (file.kind === "image") return "image/jpeg";
  return "application/octet-stream";
}

export async function GET(_request: Request, context: RouteContext) {
  const viewer = await getViewer();
  const { id, index: indexRaw } = await context.params;
  const index = Number(indexRaw);
  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  const item = await getInquiry(id);
  if (!item) return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
  if (!canViewInquiry(item, viewer)) {
    return NextResponse.json({ error: "비밀글은 작성자와 관리자만 볼 수 있습니다." }, { status: 403 });
  }

  const file = item.attachments[index];
  if (!file || file.url.startsWith("/")) {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  const pathname = file.pathname || blobPathnameFromUrl(file.url);
  if (!pathname) {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  const result = await getBlobResult(pathname);
  if (!result?.stream) {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  const bytes = Buffer.from(await new Response(result.stream).arrayBuffer());
  const disposition = file.kind === "image" ? "inline" : "attachment";
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentTypeFor(file, result.blob.contentType),
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
