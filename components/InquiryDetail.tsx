"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { formatFileSize, formatInquiryPhone, type Inquiry } from "@/lib/inquiries";

export default function InquiryDetail({ id }: { id: string }) {
  const { ready, isAdmin, user } = useAuth();
  const router = useRouter();
  const [item, setItem] = useState<Inquiry | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [status, setStatus] = useState<"loading" | "forbidden" | "missing" | "ok">("loading");
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [replyError, setReplyError] = useState("");
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [errorReplyId, setErrorReplyId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [pending, setPending] = useState(false);
  const [replyPending, setReplyPending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !ready) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/inquiries/${id}`, { cache: "no-store" });
      if (cancelled) return;
      if (res.status === 403) {
        setStatus("forbidden");
        setCanManage(false);
        return;
      }
      if (!res.ok) {
        setStatus("missing");
        setCanManage(false);
        return;
      }
      const data = (await res.json()) as { item?: Inquiry; canManage?: boolean };
      setItem(data.item || null);
      setCanManage(Boolean(data.canManage));
      setStatus(data.item ? "ok" : "missing");
    })();
    return () => {
      cancelled = true;
    };
  }, [id, mounted, ready, isAdmin, user?.username]);

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

  function startEditReply(replyId: string, content: string) {
    setEditingReplyId(replyId);
    setEditContent(content);
    setReplyError("");
    setErrorReplyId(null);
  }

  function cancelEditReply() {
    setEditingReplyId(null);
    setEditContent("");
    setReplyError("");
    setErrorReplyId(null);
  }

  async function onSaveReply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingReplyId) return;
    const content = editContent.trim();
    if (!content) {
      setReplyError("답변 내용을 입력해 주세요.");
      setErrorReplyId(editingReplyId);
      return;
    }
    setReplyPending(true);
    setReplyError("");
    setErrorReplyId(null);
    const res = await fetch(`/api/inquiries/${id}/replies/${editingReplyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const json = (await res.json()) as { error?: string; item?: Inquiry };
    setReplyPending(false);
    if (!res.ok) {
      setReplyError(json.error || "답변 수정에 실패했습니다.");
      setErrorReplyId(editingReplyId);
      return;
    }
    setItem(json.item || null);
    setEditingReplyId(null);
    setEditContent("");
  }

  async function onDeleteReply(replyId: string) {
    if (!confirm("이 답변을 삭제할까요?")) return;
    setDeletingReplyId(replyId);
    setReplyError("");
    setErrorReplyId(null);
    const res = await fetch(`/api/inquiries/${id}/replies/${replyId}`, { method: "DELETE" });
    const json = (await res.json()) as { error?: string; item?: Inquiry };
    if (!res.ok) {
      setReplyError(json.error || "답변 삭제에 실패했습니다.");
      setErrorReplyId(replyId);
      setDeletingReplyId(null);
      return;
    }
    if (editingReplyId === replyId) {
      setEditingReplyId(null);
      setEditContent("");
    }
    setItem(json.item || null);
    setDeletingReplyId(null);
  }

  async function onDelete() {
    if (!confirm("이 문의를 삭제할까요? 답변도 함께 삭제됩니다.")) return;
    setDeleting(true);
    setDeleteError("");
    const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setDeleteError(json.error || "삭제에 실패했습니다.");
      setDeleting(false);
      return;
    }
    router.push("/inquiries");
    router.refresh();
  }

  if (!mounted || !ready || status === "loading") {
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
  const phone = formatInquiryPhone(item.authorPhone);
  const showManage = Boolean(user && canManage && user.username === item.authorUsername);
  const answered = item.replies.length > 0;

  return (
    <div className="inquiry-ticket">
      <header className="inquiry-ticket-head">
        <p className="inquiry-ticket-crumb">
          <Link href="/">홈</Link> / <Link href="/inquiries">문의 게시판</Link> / {item.title}
        </p>
        <div className="inquiry-ticket-title-row">
          <div>
            <div className="inquiry-ticket-tags">
              {item.secret ? <span className="inquiry-lock">비밀</span> : null}
              <span className={answered ? "inquiry-badge is-done" : "inquiry-badge"}>{answered ? "답변완료" : "대기"}</span>
            </div>
            <h1 className="inquiry-ticket-title">{item.title}</h1>
            <p className="inquiry-ticket-date">
              <span>작성일</span>
              <time dateTime={item.createdAt}>{item.createdAt.slice(0, 10)}</time>
            </p>
          </div>
          {showManage ? (
            <div className="resource-detail-actions">
              <div className="inquiry-detail-actions">
                <Link href={`/inquiries/${id}/edit`} className="inquiry-edit-btn">
                  수정
                </Link>
                <button type="button" className="resource-delete-btn" onClick={() => void onDelete()} disabled={deleting}>
                  {deleting ? "삭제 중..." : "삭제"}
                </button>
              </div>
              {deleteError ? <p className="resource-detail-error">{deleteError}</p> : null}
            </div>
          ) : null}
        </div>
      </header>

      {isAdmin ? (
        <section className="inquiry-customer-card" aria-label="고객 정보">
          <div>
            <span>작성자</span>
            <strong>{item.authorName}</strong>
          </div>
          <div>
            <span>연락처</span>
            <strong>{phone || "-"}</strong>
          </div>
          <div>
            <span>등록일</span>
            <strong>{item.createdAt.slice(0, 10)}</strong>
          </div>
          <div>
            <span>문의 상태</span>
            <strong className={answered ? "is-done" : ""}>{answered ? "답변완료" : "대기"}</strong>
          </div>
        </section>
      ) : null}

      <section className="inquiry-ticket-body">
        <h2>문의 내용</h2>
        <p className="resource-content">{item.content}</p>
        {images.length ? (
          <div className="inquiry-images">
            {images.map((file) => (
              <a key={file.url} className="inquiry-thumb" href={file.url} target="_blank" rel="noreferrer">
                <img src={file.url} alt={file.name} />
                <span>{file.name}</span>
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
      </section>

      <section className="inquiry-replies">
        <h2>관리자 답변</h2>
        {item.replies.length === 0 ? (
          <p className="inquiry-replies-empty">아직 답변이 없습니다.</p>
        ) : (
          item.replies.map((reply) => (
            <article key={reply.id} className="inquiry-reply">
              <div className="inquiry-reply-head">
                <div className="inquiry-reply-meta">
                  <strong>관리자</strong>
                  <time dateTime={reply.createdAt}>{reply.createdAt.slice(0, 10)}</time>
                  {reply.updatedAt ? <span className="inquiry-reply-edited">수정됨</span> : null}
                </div>
                {isAdmin && editingReplyId !== reply.id ? (
                  <div className="inquiry-reply-actions">
                    <button
                      type="button"
                      className="inquiry-edit-btn"
                      onClick={() => startEditReply(reply.id, reply.content)}
                      disabled={Boolean(deletingReplyId)}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="resource-delete-btn"
                      onClick={() => void onDeleteReply(reply.id)}
                      disabled={deletingReplyId === reply.id}
                    >
                      {deletingReplyId === reply.id ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                ) : null}
              </div>
              {isAdmin && editingReplyId === reply.id ? (
                <form className="inquiry-reply-edit" onSubmit={onSaveReply}>
                  <textarea
                    rows={5}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="문의에 대한 답변을 입력해 주세요."
                  />
                  {replyError && errorReplyId === reply.id ? <p className="mt-4 text-sm text-[#dc3545]">{replyError}</p> : null}
                  <div className="inquiry-reply-edit-actions">
                    <button type="button" className="inquiry-edit-btn" onClick={cancelEditReply} disabled={replyPending}>
                      취소
                    </button>
                    <button type="submit" className="inquiry-composer-submit" disabled={replyPending}>
                      {replyPending ? "저장 중..." : "저장"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="resource-content">{reply.content}</p>
                  {isAdmin && replyError && errorReplyId === reply.id ? (
                    <p className="mt-3 text-sm text-[#dc3545]">{replyError}</p>
                  ) : null}
                </>
              )}
            </article>
          ))
        )}
      </section>

      {isAdmin ? (
        <form className="inquiry-composer" onSubmit={onReply}>
          <p className="inquiry-composer-title">답변 작성</p>
          <textarea name="content" rows={5} placeholder="문의에 대한 답변을 입력해 주세요." />
          {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
          <button type="submit" className="inquiry-composer-submit" disabled={pending}>
            {pending ? "등록 중..." : "답변 등록"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
