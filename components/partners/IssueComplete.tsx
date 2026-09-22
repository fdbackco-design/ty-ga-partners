"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicIssueView } from "@/lib/partnerApplication";
import { COMPANY } from "@/lib/data";

type IssueResponse = {
  ok?: boolean;
  error?: string;
  status?: string;
  empCode?: string;
  issue?: PublicIssueView;
  already?: boolean;
};

export default function IssueComplete({ initial }: { initial: PublicIssueView }) {
  const [view, setView] = useState(initial);
  const [modal, setModal] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const processing = pending || view.status === "SUBMITTING";

  const refresh = useCallback(async () => {
    const res = await fetch("/api/partners/issue", { cache: "no-store" });
    const data = (await res.json()) as IssueResponse;
    if (data.issue) setView(data.issue);
    return data.issue;
  }, []);

  useEffect(() => {
    if (view.status !== "SUBMITTING") return;
    const timer = window.setInterval(() => {
      void refresh();
    }, 2000);
    return () => window.clearInterval(timer);
  }, [view.status, refresh]);

  useEffect(() => {
    if (!processing) return;
    const onUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [processing]);

  async function issue() {
    setPending(true);
    setError("");
    const res = await fetch("/api/partners/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    const data = (await res.json()) as IssueResponse;
    const latest = await refresh();
    setPending(false);
    setModal(false);
    if (data.ok || latest?.status === "ISSUED") return;
    if (latest?.status === "NEEDS_MANUAL_CHECK" || data.status === "NEEDS_MANUAL_CHECK") return;
    if (latest?.status === "SUBMITTING" || res.status === 409) return;
    setError(data.error || "코드 발급에 실패했습니다.");
  }

  async function copyCode() {
    if (!view.empCode) return;
    await navigator.clipboard.writeText(view.empCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (processing) {
    return (
      <div className="issue-loading" role="alert" aria-live="assertive">
        <span className="issue-spinner" aria-hidden />
        <strong>코드를 발급받고 있습니다</strong>
        <p>창을 닫지 말고 기다려 주세요.</p>
      </div>
    );
  }

  if (view.status === "ISSUED") {
    return (
      <div className="issue-done">
        <span className="issue-check" aria-hidden />
        <p className="partner-apply-lead">코드가 발급되었습니다.</p>
        <p className="issue-code">{view.empCode}</p>
        <button type="button" className="contract-ghost" onClick={() => void copyCode()}>
          {copied ? "복사됨" : "코드 복사"}
        </button>
        <dl className="partner-apply-id">
          <div>
            <dt>소속</dt>
            <dd>{view.orgName}</dd>
          </div>
          <div>
            <dt>성명</dt>
            <dd>{view.name}</dd>
          </div>
          <div>
            <dt>아이디</dt>
            <dd>{view.empId}</dd>
          </div>
          <div>
            <dt>발급일시</dt>
            <dd>{view.issuedAt ? new Date(view.issuedAt).toLocaleString("ko-KR") : "-"}</dd>
          </div>
        </dl>
        {view.docToken ? (
          <a className="btn-apply issue-download" href={`/api/partners/doc/${view.docToken}`}>
            계약서 PDF 다운로드
          </a>
        ) : null}
      </div>
    );
  }

  if (view.status === "NEEDS_MANUAL_CHECK") {
    return (
      <div className="issue-panel">
        <p className="partner-apply-lead">접수되었습니다. 발급 결과를 확인 중이며 담당자가 곧 안내드립니다.</p>
        <p className="partner-apply-hint">문의 {COMPANY.phone} / {COMPANY.email}</p>
      </div>
    );
  }

  if (view.status === "FAILED") {
    return (
      <div className="issue-panel">
        <p className="partner-apply-alert">정보가 일치하지 않아 발급에 실패했습니다.</p>
        <p className="partner-apply-hint">성명·주민번호·휴대폰이 맞는지 확인한 뒤 다시 신청해 주세요.</p>
        <div className="partner-apply-cta">
          <button type="button" className="btn-apply" onClick={() => setModal(true)}>
            다시 신청
          </button>
        </div>
        {modal ? (
          <IssueConfirmModal
            view={view}
            checked={checked}
            pending={pending}
            error={error}
            onChecked={setChecked}
            onClose={() => setModal(false)}
            onSubmit={() => void issue()}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="issue-panel">
      <p className="partner-apply-lead">위촉계약이 체결되었습니다. 사원코드를 발급해 주세요.</p>
      <p className="partner-apply-hint">발급 후에는 온라인으로 수정·취소할 수 없습니다.</p>
      {error ? <p className="partner-apply-alert">{error}</p> : null}
      <div className="partner-apply-cta">
        <button type="button" className="btn-apply" disabled={pending} onClick={() => setModal(true)}>
          코드 발급 신청
        </button>
      </div>
      {modal ? (
        <IssueConfirmModal
          view={view}
          checked={checked}
          pending={pending}
          error={error}
          onChecked={setChecked}
          onClose={() => {
            if (!pending) setModal(false);
          }}
          onSubmit={() => void issue()}
        />
      ) : null}
    </div>
  );
}

function IssueConfirmModal({
  view,
  checked,
  pending,
  error,
  onChecked,
  onClose,
  onSubmit,
}: {
  view: PublicIssueView;
  checked: boolean;
  pending: boolean;
  error: string;
  onChecked: (value: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="issue-modal" role="dialog" aria-modal="true" aria-labelledby="issue-confirm-title">
      <div className="issue-modal-card">
        <h2 id="issue-confirm-title">발급 정보를 확인해 주세요</h2>
        <dl className="partner-apply-id">
          <div>
            <dt>성명</dt>
            <dd>{view.name}</dd>
          </div>
          <div>
            <dt>주민번호 앞자리</dt>
            <dd>{view.ssnFront}</dd>
          </div>
          <div>
            <dt>아이디</dt>
            <dd>{view.empId}</dd>
          </div>
          <div>
            <dt>소속</dt>
            <dd>{view.orgName}</dd>
          </div>
        </dl>
        <p className="partner-apply-hint">발급 후에는 온라인으로 수정·취소할 수 없습니다.</p>
        <label className="contract-check is-confirm">
          <input type="checkbox" checked={checked} onChange={(e) => onChecked(e.target.checked)} />
          확인했습니다
        </label>
        {error ? <p className="partner-apply-alert">{error}</p> : null}
        <div className="issue-modal-actions">
          <button type="button" className="contract-ghost" disabled={pending} onClick={onClose}>
            취소
          </button>
          <button type="button" className="btn-apply" disabled={!checked || pending} onClick={onSubmit}>
            {pending ? "신청 중..." : "발급 신청"}
          </button>
        </div>
      </div>
    </div>
  );
}
