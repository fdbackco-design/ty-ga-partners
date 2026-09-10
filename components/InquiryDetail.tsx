"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { formatFileSize, type Inquiry } from "@/lib/inquiries";

export default function InquiryDetail({ id }: { id: string }) {
  const { isAdmin } = useAuth();
  const [item, setItem] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState<"loading" | "forbidden" | "missing" | "ok">("loading");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/inquiries/${id}`, { cache: "no-store" });
      if (cancelled) return;
      if (res.status === 403) {
        setStatus("forbidden");
        return;
      }
      if (!res.ok) {
        setStatus("missing");
        return;
      }
      const data = (await res.json()) as { item?: Inquiry };
      setItem(data.item || null);
      setStatus(data.item ? "ok" : "missing");
    })();
    return () => {
      cancelled = true;
    };
  }, [id, mounted]);

  async function onReply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const content = String(new FormData(form).get("content") || "").trim();
    if (!content) {
      setError("답글 내용을 입력해 주세요.");
      return;
    }
    setPending(true);
    setError("");
    const res = await fetch(`/api/inquiries/${id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const json = (await res.json()) as { error?: string; item?: Inquiry };
    setPending(false);
    if (!res.ok) {
      setError(json.error || "답글 등록에 실패했습니다.");
      return;
    }
    form.reset();
    setItem(json.item || null);
  }

  if (!mounted || status === "loading") {
    return <p className="resource-empty">문의 내용을 불러오는 중입니다.</p>;
  }
  if (status === "forbidden") {
    return (
      <div>
        <h1 className="legal-title">비밀글입니다</h1>
        <p className="mt-4 text-[var(--sub)]">작성자와 관리자만 내용을 확인할 수 있습니다.</p>
        <p className="mt-6">
          <Link href="/login?next=/inquiries" className="auth-inline-link">
            로그인
          </Link>
          한 뒤 다시 확인해 주세요.
        </p>
      </div>
    );
  }
  if (status === "missing" || !item) {
    return (
      <div>
        <h1 className="legal-title">문의를 찾을 수 없습니다</h1>
        <p className="mt-4">
          <Link href="/inquiries">목록으로 돌아가기</Link>
        </p>
      </div>
    );
  }

  const images = item.attachments.filter((file) => file.kind === "image");
  const files = item.attachments.filter((file) => file.kind === "file");

  return (
    <>
      <p className="text-sm text-[var(--sub)]">
        <Link href="/">홈</Link> / <Link href="/inquiries">문의 남기기</Link> / {item.title}
      </p>
      <h1 className="legal-title">
        {item.secret ? <span className="inquiry-lock">비밀</span> : null}
        {item.title}
      </h1>
      <p className="mt-3 text-sm text-[var(--sub)]">
        {item.authorName} · {item.createdAt.slice(0, 10)}
      </p>
      <div className="legal-body is-wide">
        <p className="resource-content">{item.content}</p>
        {images.length ? (
          <div className="inquiry-images">
            {images.map((file) => (
              <a key={file.url} href={file.url} target="_blank" rel="noreferrer">
                <img src={file.url} alt={file.name} />
              </a>
            ))}
          </div>
        ) : null}
        {files.length ? (
          <ul className="inquiry-files">
            {files.map((file) => (
              <li key={file.url}>
                <a href={file.url} download={file.name}>
                  {file.name} 내려받기 ({formatFileSize(file.size)})
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        <section className="inquiry-replies">
          <h2>관리자 답변</h2>
          {item.replies.length === 0 ? (
            <p className="text-[var(--sub)]">아직 답변이 없습니다.</p>
          ) : (
            item.replies.map((reply) => (
              <article key={reply.id} className="inquiry-reply">
                <p className="inquiry-reply-meta">관리자 · {reply.createdAt.slice(0, 10)}</p>
                <p className="resource-content">{reply.content}</p>
              </article>
            ))
          )}
        </section>

        {isAdmin ? (
          <form className="form-card resource-admin" onSubmit={onReply}>
            <p className="font-extrabold mb-4">답글 작성</p>
            <textarea name="content" rows={5} placeholder="문의에 대한 답변을 입력해 주세요." />
            {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
            <button type="submit" className="btn-apply mt-6 h-[48px] px-8" disabled={pending}>
              {pending ? "등록 중..." : "답글 등록"}
            </button>
          </form>
        ) : null}
      </div>
    </>
  );
}
