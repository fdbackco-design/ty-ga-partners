import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";
import { getResourceAccess } from "@/lib/resourceAccess";
import { getResourceCategories } from "@/lib/resourceCategoriesStore";
import {
  MAX_FILE_BYTES,
  MAX_RESOURCE_FILES,
  normalizeStoredResource,
  publicResource,
  safeFileName,
  sanitizeCategoryName,
  type ResourceFile,
} from "@/lib/resources";
import { getResources, saveLocalFile, saveResource, usingBlob } from "@/lib/resourcesStore";

export const runtime = "nodejs";
export const maxDuration = 60;

function filesFromJson(body: {
  files?: ResourceFile[];
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
}): ResourceFile[] {
  const fromList = Array.isArray(body.files)
    ? body.files
        .map((file) => ({
          name: safeFileName(String(file?.name || "file")),
          url: String(file?.url || "").trim(),
          size: Number(file?.size || 0),
        }))
        .filter((file) => file.url)
    : [];
  if (fromList.length) return fromList.slice(0, MAX_RESOURCE_FILES);
  const url = String(body.fileUrl || "").trim();
  if (!url) return [];
  return [{ name: safeFileName(String(body.fileName || "file")), url, size: Number(body.fileSize || 0) }];
}

export async function GET() {
  const access = await getResourceAccess();
  if (!access.canView) {
    return NextResponse.json({ items: [], categories: [], loginRequired: true, canDownload: false });
  }
  const [items, categories] = await Promise.all([getResources(), getResourceCategories()]);
  return NextResponse.json({
    items: items.map((item) => publicResource(item, access.canDownload)),
    categories,
    loginRequired: false,
    canDownload: access.canDownload,
  });
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
      category?: string;
      files?: ResourceFile[];
      fileName?: string;
      fileUrl?: string;
      fileSize?: number;
    };
    const title = String(body.title || "").trim();
    const content = String(body.content || "").trim();
    const category = sanitizeCategoryName(String(body.category || ""));
    const files = filesFromJson(body);
    if (!title || !content) {
      return NextResponse.json({ error: "제목과 내용을 입력해 주세요." }, { status: 400 });
    }
    if (files.some((file) => file.size > MAX_FILE_BYTES)) {
      return NextResponse.json({ error: "파일은 50MB까지 업로드할 수 있습니다." }, { status: 400 });
    }
    if (files.length && process.env.VERCEL && !usingBlob()) {
      return NextResponse.json(
        {
          error:
            "Vercel에서는 Blob 스토어를 연결해야 50MB 파일을 저장할 수 있습니다. 프로젝트에 Vercel Blob을 추가해 주세요.",
        },
        { status: 503 },
      );
    }
    const item = await saveResource(
      normalizeStoredResource({
        id: crypto.randomUUID(),
        title,
        content,
        category,
        files,
        fileName: "",
        fileUrl: "",
        fileSize: 0,
        createdAt: new Date().toISOString(),
      }),
    );
    return NextResponse.json({ item });
  }

  const form = await request.formData();
  const title = String(form.get("title") || "").trim();
  const content = String(form.get("content") || "").trim();
  const category = sanitizeCategoryName(String(form.get("category") || ""));
  const uploaded = [
    ...form.getAll("files"),
    form.get("file"),
  ].filter((file): file is File => file instanceof File && file.size > 0);
  if (!title || !content) {
    return NextResponse.json({ error: "제목과 내용을 입력해 주세요." }, { status: 400 });
  }
  if (uploaded.length > MAX_RESOURCE_FILES) {
    return NextResponse.json({ error: `파일은 최대 ${MAX_RESOURCE_FILES}개까지 업로드할 수 있습니다.` }, { status: 400 });
  }
  if (uploaded.some((file) => file.size > MAX_FILE_BYTES)) {
    return NextResponse.json({ error: "파일은 50MB까지 업로드할 수 있습니다." }, { status: 400 });
  }
  if (uploaded.length && process.env.VERCEL && !usingBlob()) {
    return NextResponse.json(
      {
        error:
          "Vercel에서는 Blob 스토어를 연결해야 50MB 파일을 저장할 수 있습니다. 프로젝트에 Vercel Blob을 추가해 주세요.",
      },
      { status: 503 },
    );
  }
  if (uploaded.length && usingBlob() && process.env.VERCEL) {
    return NextResponse.json(
      { error: "50MB 파일은 Vercel Blob 업로드를 사용해 주세요." },
      { status: 400 },
    );
  }

  const id = crypto.randomUUID();
  const files: ResourceFile[] = await Promise.all(
    uploaded.map(async (file, index) => {
      const storedName = `${index + 1}-${safeFileName(file.name)}`;
      return {
        name: file.name,
        url: await saveLocalFile(id, storedName, Buffer.from(await file.arrayBuffer())),
        size: file.size,
      };
    }),
  );
  const item = await saveResource(
    normalizeStoredResource({
      id,
      title,
      content,
      category,
      files,
      fileName: "",
      fileUrl: "",
      fileSize: 0,
      createdAt: new Date().toISOString(),
    }),
  );
  return NextResponse.json({ item });
}
