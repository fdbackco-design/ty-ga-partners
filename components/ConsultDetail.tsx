"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { formatConsultBirthdate, formatConsultPhone, type Consultation } from "@/lib/consultations";

export default function ConsultDetail({
  id,
  listHref = "/consult",
  listLabel = "상담신청",
}: {
  id: string;
  listHref?: string;
  listLabel?: string;
}) {
  const { ready, isAdmin } = useAuth();
  const router = useRouter();
  const [item, setItem] = useState<Consultation | null>(null);
  const [canDelete, setCanDelete] = useState(false);
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!confirmDelete) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !deleting) setConfirmDelete(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDelete, deleting]);

  useEffect(() => {
    if (!mounted || !ready) return;
    let cancelled = false;
    void (async () => {
      let attempt = 0;
      while (!cancelled) {
        const res = await fetch(`/api/consultations/${id}`, { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 403) {
          setStatus("forbidden");
          setCanDelete(false);
          return;
        }
        if (res.status === 404 && attempt < 4) {
          attempt += 1;
          await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
          continue;
        }
        if (!res.ok) {
          setStatus("missing");
          setCanDelete(false);
          return;
        }
        const data = (await res.json()) as { item?: Consultation; canDelete?: boolean };
        setItem(data.item || null);
        setCanDelete(Boolean(data.canDelete));
        setStatus(data.item ? "ok" : "missing");
        return;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, mounted, ready, isAdmin]);

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
    const res = await fetch(`/api/consultations/${id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const json = (await res.json()) as { error?: string; item?: Consultation };
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
    const res = await fetch(`/api/consultations/${id}/replies/${editingReplyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const json = (await res.json()) as { error?: string; item?: Consultation };
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
    const res = await fetch(`/api/consultations/${id}/replies/${replyId}`, { method: "DELETE" });
    const json = (await res.json()) as { error?: string; item?: Consultation };
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

  function openDeleteModal() {
    setDeleteError("");
    setConfirmDelete(true);
  }

  async function confirmDeleteConsult() {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/consultations/${id}`, { method: "DELETE", credentials: "same-origin" });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setDeleteError(json.error || "삭제에 실패했습니다.");
        setDeleting(false);
        return;
      }
      setConfirmDelete(false);
      router.push(listHref);
      router.refresh();
    } catch {
      setDeleteError("삭제에 실패했습니다.");
      setDeleting(false);
    }
  }

  if (!mounted || !ready || status === "loading") {
    return <p className="resource-empty">상담 내용을 불러오는 중입니다.</p>;
  }
  if (status === "forbidden") {
    return (
      <div>
        <h1 className="legal-title">비밀글입니다</h1>
        <p className="mt-4 text-[var(--sub)]">신청자와 관리자만 내용을 확인할 수 있습니다.</p>
        <p className="mt-4">
          <Link href={listHref}>목록으로 돌아가기</Link>
        </p>
      </div>
    );
  }
  if (status === "missing" || !item) {
    return (
      <div>
        <h1 className="legal-title">상담신청을 찾을 수 없습니다</h1>
        <p className="mt-4">
          <Link href={listHref}>목록으로 돌아가기</Link>
        </p>
      </div>
    );
  }

  const phone = formatConsultPhone(item.phone);
  const birthdate = formatConsultBirthdate(item.birthdate);
  const answered = item.replies.length > 0;

  return (
    <div className="inquiry-ticket">
      <p className="inquiry-ticket-crumb">
        <Link href="/">홈</Link> / <Link href={listHref}>{listLabel}</Link> / {item.name}
      </p>

      <article className="inquiry-article">
        <div className="inquiry-article-head">
          <div className="inquiry-ticket-title-row">
            <div>
              <div className="inquiry-ticket-tags">
                <span className="inquiry-lock">비밀</span>
                <span className={answered ? "inquiry-badge is-done" : "inquiry-badge"}>{answered ? "답변완료" : "대기"}</span>
              </div>
              <h1 className="inquiry-ticket-title">상담신청</h1>
            </div>
            {canDelete ? (
              <div className="resource-detail-actions">
                <div className="inquiry-detail-actions">
                  <button type="button" className="resource-delete-btn" onClick={openDeleteModal} disabled={deleting}>
                    {deleting ? "삭제 중..." : "삭제"}
                  </button>
                </div>
                {deleteError && !confirmDelete ? <p className="resource-detail-error">{deleteError}</p> : null}
              </div>
            ) : null}
          </div>

          <section className="inquiry-article-meta" aria-label="신청자 정보">
            <div>
              <span>신청자</span>
              <strong>{item.name}</strong>
            </div>
            <div>
              <span>생년월일</span>
              <strong>{birthdate || "-"}</strong>
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
              <span>상담 상태</span>
              <strong className={answered ? "is-done" : ""}>{answered ? "답변완료" : "대기"}</strong>
            </div>
          </section>
        </div>

        <section className="inquiry-ticket-body">
          <p className="resource-content">{item.content}</p>
        </section>
      </article>

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
                    placeholder="상담에 대한 답변을 입력해 주세요."
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
          <textarea name="content" rows={5} placeholder="상담에 대한 답변을 입력해 주세요." />
          {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
          <button type="submit" className="inquiry-composer-submit" disabled={pending}>
            {pending ? "등록 중..." : "답변 등록"}
          </button>
        </form>
      ) : null}

      {confirmDelete ? (
        <div
          className="issue-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="consult-delete-title"
          onClick={() => {
            if (!deleting) setConfirmDelete(false);
          }}
        >
          <div className="issue-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 id="consult-delete-title">상담신청 삭제</h2>
            <p className="inquiry-delete-copy">이 상담신청을 삭제할까요? 답변도 함께 삭제됩니다.</p>
            {deleteError ? <p className="resource-detail-error">{deleteError}</p> : null}
            <div className="issue-modal-actions">
              <button type="button" className="contract-ghost" disabled={deleting} onClick={() => setConfirmDelete(false)}>
                취소
              </button>
              <button type="button" className="btn-apply inquiry-delete-confirm" disabled={deleting} onClick={() => void confirmDeleteConsult()}>
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
