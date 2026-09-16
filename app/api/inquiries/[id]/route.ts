import { NextResponse } from "next/server";
import {
  MAX_INQUIRY_ATTACHMENTS,
  MAX_INQUIRY_FILE_BYTES,
  attachmentKind,
  canManageInquiry,
  canViewInquiry,
  isBlockedFile,
  safeFileName,
  toPublicInquiry,
  type InquiryAttachment,
} from "@/lib/inquiries";
import { getInquiry, removeInquiry, saveInquiry, saveLocalInquiryFile, usingBlob } from "@/lib/inquiriesStore";
import { getViewer } from "@/lib/viewer";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

function filesFromForm(form: FormData, key: string) {
  return form
    .getAll(key)
    .filter((item): item is File => item instanceof File && Boolean(item.size));
}

async function attachmentsFromFiles(id: string, files: File[], startIndex: number) {
  const attachments: InquiryAttachment[] = [];
  for (const [index, file] of files.entries()) {
    if (isBlockedFile(file.name)) {
      throw new Error("허용되지 않는 파일 형식입니다.");
    }
    if (file.size > MAX_INQUIRY_FILE_BYTES) {
      throw new Error("첨부 파일은 각 10MB까지 업로드할 수 있습니다.");
    }
    const fileName = `${startIndex + index + 1}-${safeFileName(file.name)}`;
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

function publicPayload(item: NonNullable<Awaited<ReturnType<typeof getInquiry>>>, viewer: Awaited<ReturnType<typeof getViewer>>) {
  return {
    item: toPublicInquiry(item, viewer),
    canManage: canManageInquiry(item, viewer),
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const viewer = await getViewer();
  const { id } = await context.params;
  const item = await getInquiry(id);
  if (!item) return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
  if (!canViewInquiry(item, viewer)) {
    return NextResponse.json({ error: "비밀글은 작성자와 관리자만 볼 수 있습니다." }, { status: 403 });
  }
  return NextResponse.json(publicPayload(item, viewer));
}

export async function PATCH(request: Request, context: RouteContext) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "로그인 후 문의를 수정할 수 있습니다." }, { status: 401 });
  }

  const { id } = await context.params;
  const item = await getInquiry(id);
  if (!item) return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
  if (!canManageInquiry(item, viewer)) {
    return NextResponse.json({ error: "작성자만 문의를 수정할 수 있습니다." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") || "";
  let title = item.title;
  let content = item.content;
  let secret = item.secret;
  let attachments = item.attachments;

  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as {
        title?: string;
        content?: string;
        secret?: boolean;
        attachments?: InquiryAttachment[];
      };
      if (body.title !== undefined) title = String(body.title || "").trim();
      if (body.content !== undefined) content = String(body.content || "").trim();
      if (body.secret !== undefined) secret = Boolean(body.secret);
      if (Array.isArray(body.attachments)) {
        attachments = body.attachments.slice(0, MAX_INQUIRY_ATTACHMENTS);
        for (const file of attachments) {
          if (file.size > MAX_INQUIRY_FILE_BYTES) {
            return NextResponse.json({ error: "첨부 파일은 각 10MB까지 업로드할 수 있습니다." }, { status: 400 });
          }
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
      const keepRaw = String(form.get("keepAttachments") || "[]");
      let keepUrls: string[] = [];
      try {
        const parsed = JSON.parse(keepRaw) as unknown;
        keepUrls = Array.isArray(parsed) ? parsed.map((url) => String(url)) : [];
      } catch {
        keepUrls = item.attachments.map((file) => file.url);
      }
      const kept = item.attachments.filter((file) => keepUrls.includes(file.url));
      const files = [...filesFromForm(form, "images"), ...filesFromForm(form, "files")];
      if (kept.length + files.length > MAX_INQUIRY_ATTACHMENTS) {
        return NextResponse.json(
          { error: `파일은 최대 ${MAX_INQUIRY_ATTACHMENTS}개까지 첨부할 수 있습니다.` },
          { status: 400 },
        );
      }
      attachments = [...kept, ...(await attachmentsFromFiles(id, files, kept.length))];
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "문의 수정에 실패했습니다.";
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

  const next = { ...item, title, content, secret, attachments };
  await saveInquiry(next);
  return NextResponse.json(publicPayload(next, viewer));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "로그인 후 문의를 삭제할 수 있습니다." }, { status: 401 });
  }
  const { id } = await context.params;
  const item = await getInquiry(id);
  if (!item) return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });
  if (!canManageInquiry(item, viewer)) {
    return NextResponse.json({ error: "작성자만 문의를 삭제할 수 있습니다." }, { status: 403 });
  }
  await removeInquiry(id);
  return NextResponse.json({ ok: true });
}
