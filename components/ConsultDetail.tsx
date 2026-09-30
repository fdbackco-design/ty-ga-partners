"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
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
          </section>
        </div>

        <section className="inquiry-ticket-body">
          <p className="resource-content">{item.content}</p>
        </section>
      </article>

      <p className="mt-8 text-sm text-[var(--sub)]">
        {isAdmin ? "이 상담은 접수된 연락처로 답변해 주세요." : "접수하신 전화번호로 답변드리겠습니다."}
      </p>

      {item.replies.length > 0 ? (
        <section className="inquiry-replies">
          <h2>관리자 답변</h2>
          {item.replies.map((reply) => (
            <article key={reply.id} className="inquiry-reply">
              <div className="inquiry-reply-head">
                <div className="inquiry-reply-meta">
                  <strong>관리자</strong>
                  <time dateTime={reply.createdAt}>{reply.createdAt.slice(0, 10)}</time>
                  {reply.updatedAt ? <span className="inquiry-reply-edited">수정됨</span> : null}
                </div>
              </div>
              <p className="resource-content">{reply.content}</p>
            </article>
          ))}
        </section>
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
            <p className="inquiry-delete-copy">이 상담신청을 삭제할까요?</p>
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
