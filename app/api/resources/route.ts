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
    const fileUrl = String(body.fileUrl || "").trim();
    const hasFile = Boolean(fileUrl);
    const fileName = hasFile ? safeFileName(String(body.fileName || "")) : "";
    const fileSize = hasFile ? Number(body.fileSize || 0) : 0;
    if (!title || !content) {
      return NextResponse.json({ error: "제목과 내용을 입력해 주세요." }, { status: 400 });
    }
    if (hasFile && fileSize > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "파일은 50MB까지 업로드할 수 있습니다." }, { status: 400 });
    }
    if (hasFile && process.env.VERCEL && !usingBlob()) {
      return NextResponse.json(
        {
          error:
            "Vercel에서는 Blob 스토어를 연결해야 50MB 파일을 저장할 수 있습니다. 프로젝트에 Vercel Blob을 추가해 주세요.",
        },
        { status: 503 },
      );
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

  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const content = String(form.get("content") || "").trim();
  const file = form.get("file");
  if (!title || !content) {
    return NextResponse.json({ error: "제목과 내용을 입력해 주세요." }, { status: 400 });
  }
  const attached = file instanceof File && file.size > 0;
  if (attached && file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "파일은 50MB까지 업로드할 수 있습니다." }, { status: 400 });
  }
  if (attached && process.env.VERCEL && !usingBlob()) {
    return NextResponse.json(
      {
        error:
          "Vercel에서는 Blob 스토어를 연결해야 50MB 파일을 저장할 수 있습니다. 프로젝트에 Vercel Blob을 추가해 주세요.",
      },
      { status: 503 },
    );
  }
  if (attached && usingBlob() && process.env.VERCEL) {
    return NextResponse.json(
      { error: "50MB 파일은 Vercel Blob 업로드를 사용해 주세요." },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const fileName = attached ? safeFileName(file.name) : "";
  const fileUrl = attached ? await saveLocalFile(id, fileName, Buffer.from(await file.arrayBuffer())) : "";
  const item = await saveResource({
    id,
    title,
    content,
    fileName,
    fileUrl,
    fileSize: attached ? file.size : 0,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ item });
}
