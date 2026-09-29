"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { useAuth } from "@/components/AuthProvider";
import {
  MAX_CONTENT_IMAGE_BYTES,
  MAX_CONTENT_IMAGES,
  MAX_FILE_BYTES,
  MAX_RESOURCE_FILES,
  isAllowedResourceImageSrc,
  isResourceImageFile,
  mergePickedFiles,
  resourceFileSrc,
  type ResourceCategory,
} from "@/lib/resources";

function serializeEditor(root: HTMLElement) {
  let out = "";

  function normalizeSrc(src: string) {
    if (src.startsWith("/uploads/resources/") || src.startsWith("/api/resources/file")) return src;
    try {
      const url = new URL(src, window.location.origin);
      if (url.origin === window.location.origin && url.pathname.startsWith("/uploads/resources/")) {
        return `${url.pathname}${url.search}`;
      }
      if (url.origin === window.location.origin && url.pathname.startsWith("/api/resources/file")) {
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

async function uploadResourceBlob(file: File) {
  const pathname = `resources/uploads/${file.name}`;
  try {
    return await upload(pathname, file, {
      access: "private",
      handleUploadUrl: "/api/resources/upload",
    });
  } catch {
    return await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/resources/upload",
    });
  }
}

export default function ResourceForm() {
  const { ready, isAdmin } = useAuth();
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [storage, setStorage] = useState<"blob" | "local">("local");
  const [files, setFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [imagePending, setImagePending] = useState(false);
  const [categoryPending, setCategoryPending] = useState(false);
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
    void fetch("/api/resources/categories", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { items?: ResourceCategory[] }) => {
        setCategories(data.items || []);
      });
  }, [isAdmin]);

  async function onAddCategory() {
    const name = newCategory.trim();
    if (!name) return;
    setCategoryPending(true);
    setError("");
    try {
      const res = await fetch("/api/resources/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = (await res.json()) as { error?: string; item?: ResourceCategory; items?: ResourceCategory[] };
      if (!res.ok || !json.item) throw new Error(json.error || "분류를 추가하지 못했습니다.");
      setCategories(json.items || []);
      setCategory(json.item.name);
      setNewCategory("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "분류를 추가하지 못했습니다.");
    } finally {
      setCategoryPending(false);
    }
  }

  async function onDeleteCategory(id: string) {
    if (!confirm("이 분류를 삭제할까요? 이미 등록된 자료의 분류 이름은 그대로 남습니다.")) return;
    setError("");
    const res = await fetch(`/api/resources/categories/${id}`, { method: "DELETE" });
    const json = (await res.json()) as { error?: string; items?: ResourceCategory[] };
    if (!res.ok) {
      setError(json.error || "분류를 삭제하지 못했습니다.");
      return;
    }
    setCategories(json.items || []);
    if (category && !json.items?.some((item) => item.name === category)) setCategory("");
  }

  function onPickFiles(incoming: File[]) {
    if (!incoming.length) return;
    setFiles((current) => mergePickedFiles(current, incoming));
  }

  async function uploadContentImage(file: File) {
    if (!isResourceImageFile(file.name, file.type)) {
      throw new Error("이미지 파일만 넣을 수 있습니다.");
    }
    if (file.size > MAX_CONTENT_IMAGE_BYTES) {
      throw new Error("본문 이미지는 10MB까지 업로드할 수 있습니다.");
    }
    if (storage === "blob") {
      const blob = await uploadResourceBlob(file);
      return resourceFileSrc(blob.url, blob.pathname);
    }
    const data = new FormData();
    data.set("file", file);
    const res = await fetch("/api/resources/images", { method: "POST", body: data });
    const json = (await res.json()) as { error?: string; url?: string };
    if (!res.ok || !json.url) throw new Error(json.error || "이미지 업로드에 실패했습니다.");
    return resourceFileSrc(json.url);
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
    if (!title || !content) {
      setError("제목과 내용을 입력해 주세요.");
      return;
    }
    if (files.length > MAX_RESOURCE_FILES) {
      setError(`파일은 최대 ${MAX_RESOURCE_FILES}개까지 업로드할 수 있습니다.`);
      return;
    }
    if (files.some((file) => file.size > MAX_FILE_BYTES)) {
      setError("파일은 50MB까지 업로드할 수 있습니다.");
      return;
    }
    setPending(true);
    setError("");
    try {
      if (storage === "blob") {
        const uploaded: { name: string; url: string; size: number }[] = [];
        for (const file of files) {
          const blob = await uploadResourceBlob(file);
          uploaded.push({
            name: file.name,
            url: resourceFileSrc(blob.url, blob.pathname),
            size: file.size,
          });
        }
        const res = await fetch("/api/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            category,
            files: uploaded,
          }),
        });
        const json = (await res.json()) as { error?: string; item?: { id: string } };
        if (!res.ok) throw new Error(json.error || "등록에 실패했습니다.");
        router.push(json.item?.id ? `/resources/${json.item.id}` : "/resources");
        return;
      }
      data.set("content", content);
      data.set("category", category);
      data.delete("file");
      data.delete("files");
      for (const file of files) data.append("files", file);
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
          <label htmlFor="resource-category">분류</label>
          <div className="resource-category-field">
            <select id="resource-category" name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">분류 선택</option>
              {categories.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <div className="resource-category-admin">
              <p>분류 관리</p>
              <div className="resource-category-add">
                <input
                  type="text"
                  value={newCategory}
                  maxLength={20}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="새 분류 이름"
                  aria-label="새 분류 이름"
                />
                <button type="button" className="file-pick-btn" disabled={categoryPending} onClick={() => void onAddCategory()}>
                  {categoryPending ? "추가 중..." : "분류 추가"}
                </button>
              </div>
              {categories.length ? (
                <ul>
                  {categories.map((item) => (
                    <li key={item.id}>
                      <span>{item.name}</span>
                      <button type="button" onClick={() => void onDeleteCategory(item.id)}>
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="resource-category-empty">등록된 분류가 없습니다. 추가하면 위에서 선택할 수 있습니다.</span>
              )}
            </div>
          </div>
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
              multiple
              onChange={(e) => {
                const picked = e.target.files ? [...e.target.files] : [];
                e.currentTarget.value = "";
                onPickFiles(picked);
              }}
            />
            <span className="file-pick-name">
              {files.length ? `${files.length}개 선택됨` : "선택된 파일 없음"}
            </span>
          </div>
          {files.length ? (
            <ul className="inquiry-keep-files resource-pick-files">
              {files.map((file, index) => (
                <li key={`${file.name}-${file.size}-${index}`}>
                  <span>
                    {file.name} ({Math.max(1, Math.round(file.size / 1024))}KB)
                  </span>
                  <button type="button" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}>
                    빼기
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-1 text-xs text-[var(--sub)]">
            파일은 선택 사항입니다. 한 번에 여러 개를 고르거나, 파일 선택을 다시 눌러 기존 파일에 이어서 추가할 수
            있습니다. 최대 {MAX_RESOURCE_FILES}개, 파일당 50MB까지 업로드할 수 있으며, MP4, WebM 등 영상은 자료
            페이지에서 바로 재생됩니다.
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
