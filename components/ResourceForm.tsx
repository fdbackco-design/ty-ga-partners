"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { useAuth } from "@/components/AuthProvider";
import {
  MAX_CONTENT_IMAGE_BYTES,
  MAX_CONTENT_IMAGES,
  MAX_FILE_BYTES,
  isAllowedResourceImageSrc,
  isResourceImageFile,
} from "@/lib/resources";

function serializeEditor(root: HTMLElement) {
  let out = "";

  function normalizeSrc(src: string) {
    if (src.startsWith("/uploads/resources/")) return src;
    try {
      const url = new URL(src, window.location.origin);
      if (url.origin === window.location.origin && url.pathname.startsWith("/uploads/resources/")) {
        return `${url.pathname}${url.search}`;
      }
      return src;
    } catch {
      return src;
    }
  }

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent || "";
      return;
    }
    if (!(node instanceof HTMLElement)) {
      node.childNodes.forEach(walk);
      return;
    }
    if (node.tagName === "IMG") {
      const src = normalizeSrc(node.getAttribute("src") || "");
      const alt = (node.getAttribute("alt") || "").replace(/[[\]]/g, "");
      if (src && isAllowedResourceImageSrc(src)) out += `![${alt}](${src})`;
      return;
    }
    if (node.tagName === "BR") {
      out += "\n";
      return;
    }
    if (node.tagName === "DIV" || node.tagName === "P") {
      if (out && !out.endsWith("\n")) out += "\n";
      node.childNodes.forEach(walk);
      if (!out.endsWith("\n")) out += "\n";
      return;
    }
    node.childNodes.forEach(walk);
  }

  root.childNodes.forEach(walk);
  return out.trim();
}

export default function ResourceForm() {
  const { ready, isAdmin } = useAuth();
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [storage, setStorage] = useState<"blob" | "local">("local");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [imagePending, setImagePending] = useState(false);
  const [emptyEditor, setEmptyEditor] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!isAdmin) router.replace("/resources");
  }, [ready, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    void fetch("/api/admin/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { storage?: "blob" | "local" }) => {
        if (data.storage === "blob") setStorage("blob");
      });
  }, [isAdmin]);

  async function uploadContentImage(file: File) {
    if (!isResourceImageFile(file.name, file.type)) {
      throw new Error("이미지 파일만 넣을 수 있습니다.");
    }
    if (file.size > MAX_CONTENT_IMAGE_BYTES) {
      throw new Error("본문 이미지는 10MB까지 업로드할 수 있습니다.");
    }
    if (storage === "blob") {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/resources/upload",
      });
      return blob.url;
    }
    const data = new FormData();
    data.set("file", file);
    const res = await fetch("/api/resources/images", { method: "POST", body: data });
    const json = (await res.json()) as { error?: string; url?: string };
    if (!res.ok || !json.url) throw new Error(json.error || "이미지 업로드에 실패했습니다.");
    return json.url;
  }

  function countImages() {
    return editorRef.current?.querySelectorAll("img").length || 0;
  }

  function saveSelection() {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || !sel.rangeCount || !editor.contains(sel.anchorNode)) return;
    savedRange.current = sel.getRangeAt(0).cloneRange();
  }

  function insertImage(src: string, alt: string) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.className = "resource-inline-image";
    const range = savedRange.current;
    const sel = window.getSelection();
    if (range && editor.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      range.insertNode(img);
      range.setStartAfter(img);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
      savedRange.current = range.cloneRange();
    } else {
      editor.appendChild(img);
    }
    setEmptyEditor(false);
  }

  async function onInsertImage(file: File | null) {
    if (!file) return;
    if (countImages() >= MAX_CONTENT_IMAGES) {
      setError(`본문 이미지는 최대 ${MAX_CONTENT_IMAGES}장까지 넣을 수 있습니다.`);
      return;
    }
    setImagePending(true);
    setError("");
    try {
      const url = await uploadContentImage(file);
      insertImage(url, file.name.replace(/\.[^.]+$/, ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setImagePending(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    const content = editorRef.current ? serializeEditor(editorRef.current) : "";
    const file = data.get("file");
    const attached = file instanceof File && file.size > 0;
    if (!title || !content) {
      setError("제목과 내용을 입력해 주세요.");
      return;
    }
    if (attached && file.size > MAX_FILE_BYTES) {
      setError("파일은 50MB까지 업로드할 수 있습니다.");
      return;
    }
    setPending(true);
    setError("");
    try {
      if (storage === "blob") {
        let fileName = "";
        let fileUrl = "";
        let fileSize = 0;
        if (attached) {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/resources/upload",
          });
          fileName = file.name;
          fileUrl = blob.url;
          fileSize = file.size;
        }
        const res = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            fileName,
            fileUrl,
            fileSize,
          }),
        });
        const json = (await res.json()) as { error?: string; item?: { id: string } };
        if (!res.ok) throw new Error(json.error || "등록에 실패했습니다.");
        router.push(json.item?.id ? `/resources/${json.item.id}` : "/resources");
        return;
      }
      data.set("content", content);
      const res = await fetch("/api/resources", { method: "POST", body: data });
      const json = (await res.json()) as { error?: string; item?: { id: string } };
      if (!res.ok) throw new Error(json.error || "등록에 실패했습니다.");
      router.push(json.item?.id ? `/resources/${json.item.id}` : "/resources");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했습니다.");
      setPending(false);
    }
  }

  return (
    <form className="form-card resource-write" onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="span-2">
          <label htmlFor="resource-title">
            제목<span className="req">*</span>
          </label>
          <input id="resource-title" name="title" type="text" />
        </div>
        <div className="span-2">
          <div className="resource-editor-head">
            <label htmlFor="resource-content">
              내용<span className="req">*</span>
            </label>
            <button
              type="button"
              className="file-pick-btn"
              disabled={imagePending}
              onClick={() => imageInputRef.current?.click()}
            >
              {imagePending ? "이미지 올리는 중..." : "이미지 삽입"}
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => void onInsertImage(e.target.files?.[0] || null)}
            />
          </div>
          <div
            id="resource-content"
            ref={editorRef}
            className={`resource-editor${emptyEditor ? " is-empty" : ""}`}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="내용"
            data-placeholder="내용을 입력해 주세요. 이미지를 삽입할 수 있습니다."
            onInput={(e) => {
              const text = e.currentTarget.textContent?.replace(/\u200B/g, "").trim();
              setEmptyEditor(!text && e.currentTarget.querySelectorAll("img").length === 0);
              saveSelection();
            }}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onBlur={saveSelection}
            onPaste={(e) => {
              const image = [...(e.clipboardData?.items || [])].find((item) => item.type.startsWith("image/"));
              if (image) {
                const file = image.getAsFile();
                if (!file) return;
                e.preventDefault();
                void onInsertImage(file);
                return;
              }
              e.preventDefault();
              const text = e.clipboardData?.getData("text/plain") || "";
              document.execCommand("insertText", false, text);
            }}
          />
        </div>
        <div className="span-2">
          <label htmlFor="resource-file">파일</label>
          <div className="file-pick-row">
            <label className="file-pick-btn" htmlFor="resource-file">
              파일 선택
            </label>
            <input
              id="resource-file"
              name="file"
              type="file"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
            />
            <span className="file-pick-name">{fileName || "선택된 파일 없음"}</span>
          </div>
          <p className="mt-1 text-xs text-[var(--sub)]">
            파일은 선택 사항입니다. 최대 50MB까지 업로드할 수 있으며, MP4, WebM 등 영상은 자료 페이지에서 바로 재생됩니다.
          </p>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
      <div className="resource-write-actions">
        <button type="submit" className="btn-apply h-[48px] px-8" disabled={pending || imagePending}>
          {pending ? "등록 중..." : "자료 등록"}
        </button>
      </div>
    </form>
  );
}
