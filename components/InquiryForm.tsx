"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useAuth } from "@/components/AuthProvider";
import {
  MAX_INQUIRY_ATTACHMENTS,
  MAX_INQUIRY_FILE_BYTES,
  attachmentKind,
  isBlockedFile,
  type Inquiry,
  type InquiryAttachment,
} from "@/lib/inquiries";

export default function InquiryForm({ item }: { item?: Inquiry }) {
  const { user, ready, isAdmin } = useAuth();
  const router = useRouter();
  const isEdit = Boolean(item);
  const [storage, setStorage] = useState<"blob" | "local">("local");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [kept, setKept] = useState<InquiryAttachment[]>(item?.attachments || []);

  useEffect(() => {
    void fetch("/api/inquiries", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { storage?: "blob" | "local" }) => {
        if (data.storage === "blob") setStorage("blob");
      });
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace(`/login?next=${isEdit ? `/inquiries/${item?.id}/edit` : "/inquiries/new"}`);
  }, [ready, user, router, isEdit, item?.id]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const content = String(data.get("content") || "").trim();
    const secret = data.get("secret") === "on";
    const images = [...((data.getAll("images") as File[]) || [])].filter((file) => file.size);
    const files = [...((data.getAll("files") as File[]) || [])].filter((file) => file.size);
    const allFiles = [...images, ...files];
    if (!title || !content) {
      setError("제목과 내용을 입력해 주세요.");
      return;
    }
    if (kept.length + allFiles.length > MAX_INQUIRY_ATTACHMENTS) {
      setError(`파일은 최대 ${MAX_INQUIRY_ATTACHMENTS}개까지 첨부할 수 있습니다.`);
      return;
    }
    for (const file of allFiles) {
      if (isBlockedFile(file.name)) {
        setError("허용되지 않는 파일 형식입니다.");
        return;
      }
      if (file.size > MAX_INQUIRY_FILE_BYTES) {
        setError("첨부 파일은 각 10MB까지 업로드할 수 있습니다.");
        return;
      }
    }

    setPending(true);
    setError("");
    try {
      const endpoint = isEdit ? `/api/inquiries/${item?.id}` : "/api/inquiries";
      const method = isEdit ? "PATCH" : "POST";
      if (storage === "blob") {
        const attachments: InquiryAttachment[] = [...kept];
        for (const file of allFiles) {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/inquiries/upload",
          });
          attachments.push({
            name: file.name,
            url: blob.url,
            size: file.size,
            kind: attachmentKind(file.name, file.type),
          });
        }
        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            secret,
            attachments,
            authorPhone: user?.phone || "",
          }),
        });
        const json = (await res.json()) as { error?: string; item?: { id: string } };
        if (!res.ok) throw new Error(json.error || (isEdit ? "문의 수정에 실패했습니다." : "문의 등록에 실패했습니다."));
        router.push(`/inquiries/${json.item?.id || item?.id || ""}`);
        router.refresh();
        return;
      }

      if (isEdit) data.set("keepAttachments", JSON.stringify(kept.map((file) => file.url)));
      const res = await fetch(endpoint, { method, body: data });
      const json = (await res.json()) as { error?: string; item?: { id: string } };
      if (!res.ok) throw new Error(json.error || (isEdit ? "문의 수정에 실패했습니다." : "문의 등록에 실패했습니다."));
      router.push(`/inquiries/${json.item?.id || item?.id || ""}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : isEdit ? "문의 수정에 실패했습니다." : "문의 등록에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  if (!ready || !user) return <p className="resource-empty">로그인 확인 중입니다.</p>;

  return (
    <form className="form-card resource-admin" onSubmit={onSubmit}>
      <p className="mb-4 text-sm text-[var(--sub)]">
        {isAdmin ? "관리자" : user.name}님으로 {isEdit ? "문의가 수정됩니다." : "문의가 등록됩니다."}
      </p>
      <input type="hidden" name="authorPhone" value={user?.phone || ""} />
      <div className="form-grid">
        <div className="span-2">
          <label htmlFor="inquiry-title">
            제목<span className="req">*</span>
          </label>
          <input id="inquiry-title" name="title" type="text" maxLength={80} defaultValue={item?.title || ""} />
        </div>
        <div className="span-2">
          <label htmlFor="inquiry-content">
            내용<span className="req">*</span>
          </label>
          <textarea id="inquiry-content" name="content" rows={8} defaultValue={item?.content || ""} />
        </div>
        {kept.length ? (
          <div className="span-2">
            <p className="form-keep-label">기존 첨부</p>
            <ul className="inquiry-keep-files">
              {kept.map((file) => (
                <li key={file.url}>
                  <span>{file.name}</span>
                  <button type="button" onClick={() => setKept((current) => current.filter((row) => row.url !== file.url))}>
                    빼기
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="span-2">
          <label htmlFor="inquiry-images">이미지 첨부</label>
          <input id="inquiry-images" name="images" type="file" accept="image/*" multiple />
        </div>
        <div className="span-2">
          <label htmlFor="inquiry-files">파일 첨부</label>
          <input id="inquiry-files" name="files" type="file" multiple />
          <p className="mt-1 text-xs text-[var(--sub)]">이미지는 미리보기로, 파일은 내려받기로 표시됩니다. 각 10MB, 최대 8개.</p>
        </div>
        <div className="span-2">
          <label className="agree-row">
            <input type="checkbox" name="secret" defaultChecked={item?.secret} />
            비밀글로 작성합니다. 작성자와 관리자만 내용을 볼 수 있습니다.
          </label>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
      <button type="submit" className="btn-apply mt-6 h-[48px] px-8" disabled={pending}>
        {pending ? (isEdit ? "수정 중..." : "등록 중...") : isEdit ? "문의 수정" : "문의 등록"}
      </button>
    </form>
  );
}
