import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { MAX_INQUIRY_FILE_BYTES } from "@/lib/inquiries";
import { getViewer } from "@/lib/viewer";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "로그인 후 파일을 첨부할 수 있습니다." }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        maximumSizeInBytes: MAX_INQUIRY_FILE_BYTES,
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(json);
  } catch (error) {
    const message = error instanceof Error ? error.message : "업로드 토큰을 만들지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
