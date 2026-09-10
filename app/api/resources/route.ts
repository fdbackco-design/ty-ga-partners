import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";
import { MAX_FILE_BYTES, safeFileName } from "@/lib/resources";
import { getResources, saveLocalFile, saveResource, usingBlob } from "@/lib/resourcesStore";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({ items: await getResources() });
}

export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ error: "관리자만 자료를 등록할 수 있습니다." }, { status: 401 });
  }

  if (process.env.VERCEL && !usingBlob()) {
    return NextResponse.json(
      {
        error:
          "Vercel에서는 Blob 스토어를 연결해야 50MB 파일을 저장할 수 있습니다. 프로젝트에 Vercel Blob을 추가해 주세요.",
      },
      { status: 503 },
    );
  }

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      title?: string;
      content?: string;
      fileName?: string;
      fileUrl?: string;
      fileSize?: number;
    };
    const title = String(body.title || "").trim();
    const content = String(body.content || "").trim();
    const fileName = safeFileName(String(body.fileName || ""));
    const fileUrl = String(body.fileUrl || "").trim();
    const fileSize = Number(body.fileSize || 0);
    if (!title || !content || !fileUrl) {
      return NextResponse.json({ error: "제목, 내용, 파일을 모두 등록해 주세요." }, { status: 400 });
    }
    if (fileSize > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "파일은 50MB까지 업로드할 수 있습니다." }, { status: 400 });
    }
    const item = await saveResource({
      id: crypto.randomUUID(),
      title,
      content,
      fileName,
      fileUrl,
      fileSize,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ item });
  }

  if (usingBlob() && process.env.VERCEL) {
    return NextResponse.json(
      { error: "50MB 파일은 Vercel Blob 업로드를 사용해 주세요." },
      { status: 400 },
    );
  }

  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const content = String(form.get("content") || "").trim();
  const file = form.get("file");
  if (!title || !content || !(file instanceof File)) {
    return NextResponse.json({ error: "제목, 내용, 파일을 모두 등록해 주세요." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "파일은 50MB까지 업로드할 수 있습니다." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const fileName = safeFileName(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileUrl = await saveLocalFile(id, fileName, buffer);
  const item = await saveResource({
    id,
    title,
    content,
    fileName,
    fileUrl,
    fileSize: file.size,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ item });
}
