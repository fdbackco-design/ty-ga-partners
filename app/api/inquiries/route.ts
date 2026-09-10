import { NextResponse } from "next/server";
import {
  MAX_INQUIRY_ATTACHMENTS,
  MAX_INQUIRY_FILE_BYTES,
  attachmentKind,
  isBlockedFile,
  safeFileName,
  toInquirySummary,
  type Inquiry,
  type InquiryAttachment,
} from "@/lib/inquiries";
import { getInquiries, saveInquiry, saveLocalInquiryFile, usingBlob } from "@/lib/inquiriesStore";
import { sendInquiryNotice } from "@/lib/mail";
import { getViewer } from "@/lib/viewer";

export const runtime = "nodejs";
export const maxDuration = 60;

function filesFromForm(form: FormData, key: string) {
  return form
    .getAll(key)
    .filter((item): item is File => item instanceof File && Boolean(item.size));
}

async function attachmentsFromFiles(id: string, files: File[]) {
  if (files.length > MAX_INQUIRY_ATTACHMENTS) {
    throw new Error(`파일은 최대 ${MAX_INQUIRY_ATTACHMENTS}개까지 첨부할 수 있습니다.`);
  }
  const attachments: InquiryAttachment[] = [];
  for (const [index, file] of files.entries()) {
    if (isBlockedFile(file.name)) {
      throw new Error("허용되지 않는 파일 형식입니다.");
    }
    if (file.size > MAX_INQUIRY_FILE_BYTES) {
      throw new Error("첨부 파일은 각 10MB까지 업로드할 수 있습니다.");
    }
    const fileName = `${index + 1}-${safeFileName(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    attachments.push({
      name: safeFileName(file.name),
      url: await saveLocalInquiryFile(id, fileName, buffer),
      size: file.size,
      kind: attachmentKind(file.name, file.type),
    });
  }
  return attachments;
}

export async function GET() {
  const viewer = await getViewer();
  const items = await getInquiries();
  return NextResponse.json({
    items: items.map((item) => toInquirySummary(item, viewer)),
    storage: usingBlob() ? "blob" : "local",
  });
}

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "로그인 후 문의를 남길 수 있습니다." }, { status: 401 });
  }

  if (process.env.VERCEL && !usingBlob()) {
    return NextResponse.json(
      { error: "Vercel에서는 Blob 스토어를 연결해야 첨부 파일을 저장할 수 있습니다." },
      { status: 503 },
    );
  }

  const contentType = request.headers.get("content-type") || "";
  const id = crypto.randomUUID();
  let title = "";
  let content = "";
  let secret = false;
  let attachments: InquiryAttachment[] = [];

  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as {
        title?: string;
        content?: string;
        secret?: boolean;
        attachments?: InquiryAttachment[];
      };
      title = String(body.title || "").trim();
      content = String(body.content || "").trim();
      secret = Boolean(body.secret);
      attachments = Array.isArray(body.attachments) ? body.attachments.slice(0, MAX_INQUIRY_ATTACHMENTS) : [];
      for (const file of attachments) {
        if (file.size > MAX_INQUIRY_FILE_BYTES) {
          return NextResponse.json({ error: "첨부 파일은 각 10MB까지 업로드할 수 있습니다." }, { status: 400 });
        }
      }
    } else {
      if (usingBlob() && process.env.VERCEL) {
        return NextResponse.json({ error: "첨부 파일은 Vercel Blob 업로드를 사용해 주세요." }, { status: 400 });
      }
      const form = await request.formData();
      title = String(form.get("title") || "").trim();
      content = String(form.get("content") || "").trim();
      secret = String(form.get("secret") || "") === "on" || String(form.get("secret") || "") === "true";
      const files = [...filesFromForm(form, "images"), ...filesFromForm(form, "files")];
      attachments = await attachmentsFromFiles(id, files);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "문의 등록에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!title || !content) {
    return NextResponse.json({ error: "제목과 내용을 입력해 주세요." }, { status: 400 });
  }
  if (title.length > 80) {
    return NextResponse.json({ error: "제목은 80자 이내로 입력해 주세요." }, { status: 400 });
  }
  if (content.length > 5000) {
    return NextResponse.json({ error: "내용은 5,000자 이내로 입력해 주세요." }, { status: 400 });
  }

  const item: Inquiry = {
    id,
    title,
    content,
    secret,
    authorUsername: viewer.username,
    authorName: viewer.name,
    attachments,
    replies: [],
    createdAt: new Date().toISOString(),
  };
  await saveInquiry(item);
  try {
    await sendInquiryNotice(item);
  } catch (error) {
    console.error("[mail] 문의 알림 메일 발송 실패", error);
  }
  return NextResponse.json({ item });
}
