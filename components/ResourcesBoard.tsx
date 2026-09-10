"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { useAuth } from "@/components/AuthProvider";
import { MAX_FILE_BYTES } from "@/lib/resources";
import { formatFileSize, type ResourcePost } from "@/lib/resources";

export default function ResourcesBoard() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<ResourcePost[]>([]);
  const [storage, setStorage] = useState<"blob" | "local">("local");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const res = await fetch("/api/resources", { cache: "no-store" });
    const data = (await res.json()) as { items?: ResourcePost[] };
    setItems(data.items || []);
    setLoaded(true);
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void fetch("/api/admin/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { storage?: "blob" | "local" }) => {
        if (data.storage === "blob") setStorage("blob");
      });
  }, [isAdmin]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const content = String(data.get("content") || "").trim();
    const file = data.get("file");
    if (!title || !content || !(file instanceof File) || !file.size) {
      setError("제목, 내용, 파일을 모두 입력해 주세요.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("파일은 50MB까지 업로드할 수 있습니다.");
      return;
    }
    setPending(true);
    setError("");
    try {
      if (storage === "blob") {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/resources/upload",
        });
        const res = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            fileName: file.name,
            fileUrl: blob.url,
            fileSize: file.size,
          }),
        });
        const json = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(json.error || "등록에 실패했습니다.");
      } else {
        const res = await fetch("/api/resources", { method: "POST", body: data });
        const json = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(json.error || "등록에 실패했습니다.");
      }
      form.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("이 자료를 삭제할까요?")) return;
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      setError(json.error || "삭제에 실패했습니다.");
      return;
    }
    await load();
  }

  return (
    <>
      {isAdmin ? (
        <form className="form-card resource-admin" onSubmit={onSubmit}>
          <p className="font-extrabold mb-4">자료 등록</p>
          <div className="form-grid">
            <div className="span-2">
              <label htmlFor="resource-title">
                제목<span className="req">*</span>
              </label>
              <input id="resource-title" name="title" type="text" />
            </div>
            <div className="span-2">
              <label htmlFor="resource-content">
                내용<span className="req">*</span>
              </label>
              <textarea id="resource-content" name="content" rows={5} />
            </div>
            <div className="span-2">
              <label htmlFor="resource-file">
                파일<span className="req">*</span>
              </label>
              <input id="resource-file" name="file" type="file" />
              <p className="mt-1 text-xs text-[var(--sub)]">최대 50MB까지 업로드할 수 있습니다.</p>
            </div>
          </div>
          {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
          <button type="submit" className="btn-apply mt-6 h-[48px] px-8" disabled={pending}>
            {pending ? "등록 중..." : "자료 등록"}
          </button>
        </form>
      ) : null}

      {!loaded ? null : items.length === 0 ? (
        <p className="resource-empty">등록된 자료가 없습니다.</p>
      ) : (
        <ul className="resource-list">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/resources/${item.id}`}>
                <strong>{item.title}</strong>
                <em>{item.content}</em>
                <span>
                  {item.fileName} · {formatFileSize(item.fileSize)} ·{" "}
                  {item.createdAt.slice(0, 10)}
                </span>
              </Link>
              {isAdmin ? (
                <button type="button" className="resource-delete" onClick={() => onDelete(item.id)}>
                  삭제
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
