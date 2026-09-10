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
  type InquiryAttachment,
} from "@/lib/inquiries";

export default function InquiryForm() {
  const { user, ready, isAdmin } = useAuth();
  const router = useRouter();
  const [storage, setStorage] = useState<"blob" | "local">("local");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void fetch("/api/inquiries", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { storage?: "blob" | "local" }) => {
        if (data.storage === "blob") setStorage("blob");
      });
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login?next=/inquiries/new");
  }, [ready, user, router]);

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
    if (allFiles.length > MAX_INQUIRY_ATTACHMENTS) {
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
      if (storage === "blob") {
        const attachments: InquiryAttachment[] = [];
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
        const res = await fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, secret, attachments }),
        });
        const json = (await res.json()) as { error?: string; item?: { id: string } };
        if (!res.ok) throw new Error(json.error || "문의 등록에 실패했습니다.");
        router.push(`/inquiries/${json.item?.id || ""}`);
        return;
      }

      const res = await fetch("/api/inquiries", { method: "POST", body: data });
      const json = (await res.json()) as { error?: string; item?: { id: string } };
      if (!res.ok) throw new Error(json.error || "문의 등록에 실패했습니다.");
      router.push(`/inquiries/${json.item?.id || ""}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "문의 등록에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  if (!ready || !user) return <p className="resource-empty">로그인 확인 중입니다.</p>;

  return (
    <form className="form-card resource-admin" onSubmit={onSubmit}>
      <p className="mb-4 text-sm text-[var(--sub)]">
        {isAdmin ? "관리자" : user.name}님으로 문의가 등록됩니다.
      </p>
      <div className="form-grid">
        <div className="span-2">
          <label htmlFor="inquiry-title">
            제목<span className="req">*</span>
          </label>
          <input id="inquiry-title" name="title" type="text" maxLength={80} />
        </div>
        <div className="span-2">
          <label htmlFor="inquiry-content">
            내용<span className="req">*</span>
          </label>
          <textarea id="inquiry-content" name="content" rows={8} />
        </div>
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
            <input type="checkbox" name="secret" />
            비밀글로 작성합니다. 작성자와 관리자만 내용을 볼 수 있습니다.
          </label>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
      <button type="submit" className="btn-apply mt-6 h-[48px] px-8" disabled={pending}>
        {pending ? "등록 중..." : "문의 등록"}
      </button>
    </form>
  );
}
