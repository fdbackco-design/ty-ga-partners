import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin";
import { MAX_CONTENT_IMAGE_BYTES, isResourceImageFile, safeFileName } from "@/lib/resources";
import { saveLocalFile, usingBlob } from "@/lib/resourcesStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return NextResponse.json({ error: "관리자만 이미지를 등록할 수 있습니다." }, { status: 401 });
  }

  if (process.env.VERCEL && usingBlob()) {
    return NextResponse.json({ error: "이미지 업로드는 Blob 업로드를 사용해 주세요." }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) {
    return NextResponse.json({ error: "이미지 파일을 선택해 주세요." }, { status: 400 });
  }
  if (!isResourceImageFile(file.name, file.type)) {
    return NextResponse.json({ error: "이미지 파일만 넣을 수 있습니다." }, { status: 400 });
  }
  if (file.size > MAX_CONTENT_IMAGE_BYTES) {
    return NextResponse.json({ error: "본문 이미지는 10MB까지 업로드할 수 있습니다." }, { status: 400 });
  }

  const fileName = safeFileName(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await saveLocalFile(`content/${crypto.randomUUID()}`, fileName, buffer);
  return NextResponse.json({ url, name: fileName, size: file.size });
}
