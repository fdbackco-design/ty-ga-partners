"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Detail = {
  application: {
    id: string;
    status: string;
    channelSlug: string;
    orgCode: string;
    orgName: string | null;
    joinChannel: string;
    certName: string | null;
    certMobile: string | null;
    ssnMasked: string | null;
    zipCode: string | null;
    address1: string | null;
    address2: string | null;
    bankName: string | null;
    accountNoMasked: string | null;
    accountHolder: string | null;
    agreements: { key: string; agreedAt: string }[] | null;
    privacyAgreed: boolean;
    docToken: string | null;
    docHash: string | null;
    docRevoked: boolean;
    signedAt: string | null;
    empId: string;
    empCode: string | null;
    issuedAt: string | null;
    issueAttempts: number;
    lastErrorCode: number | null;
    lastErrorMessage: string | null;
    manualCheckNote: string | null;
  };
  user: { username: string; name: string; phone: string; rrnFront: string } | null;
  logs: { id: string; event: string; meta: Record<string, unknown>; created_at: string; ip: string | null }[];
};

export default function PartnerAdminDetail({ initial }: { initial: Detail }) {
  const router = useRouter();
  const [empCode, setEmpCode] = useState(initial.application.empCode || "");
  const [note, setNote] = useState(initial.application.manualCheckNote || "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  const app = initial.application;
  const canResolve = app.status === "NEEDS_MANUAL_CHECK" || app.status === "FAILED" || app.status === "SUBMITTING";

  async function resolve(action: "already_issued" | "retry") {
    setPending(action);
    setError("");
    const res = await fetch(`/api/admin/partners/${app.id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action === "already_issued" ? { action, empCode, note } : { action, note }),
    });
    const data = (await res.json()) as { error?: string };
    setPending("");
    if (!res.ok) {
      setError(data.error || "처리에 실패했습니다.");
      return;
    }
    router.refresh();
  }

  async function toggleRevoke() {
    setPending("revoke");
    setError("");
    const res = await fetch(`/api/admin/partners/${app.id}/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revoked: !app.docRevoked }),
    });
    const data = (await res.json()) as { error?: string };
    setPending("");
    if (!res.ok) {
      setError(data.error || "문서 상태 변경에 실패했습니다.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="admin-detail">
      <dl className="partner-apply-id">
        <div>
          <dt>상태</dt>
          <dd>{app.status}</dd>
        </div>
        <div>
          <dt>성명</dt>
          <dd>{app.certName}</dd>
        </div>
        <div>
          <dt>아이디</dt>
          <dd>{app.empId || initial.user?.username}</dd>
        </div>
        <div>
          <dt>휴대폰</dt>
          <dd>{app.certMobile}</dd>
        </div>
        <div>
          <dt>주민번호</dt>
          <dd>{app.ssnMasked}</dd>
        </div>
        <div>
          <dt>주소</dt>
          <dd>
            ({app.zipCode}) {app.address1} {app.address2}
          </dd>
        </div>
        <div>
          <dt>계좌</dt>
          <dd>
            {app.bankName} {app.accountNoMasked} / {app.accountHolder}
          </dd>
        </div>
        <div>
          <dt>소속</dt>
          <dd>
            {app.orgName || app.joinChannel} ({app.orgCode})
          </dd>
        </div>
        <div>
          <dt>사원코드</dt>
          <dd>{app.empCode || "-"}</dd>
        </div>
        <div>
          <dt>발급 시도</dt>
          <dd>{app.issueAttempts}</dd>
        </div>
        <div>
          <dt>마지막 오류</dt>
          <dd>
            {app.lastErrorCode ?? "-"} {app.lastErrorMessage || ""}
          </dd>
        </div>
      </dl>

      <div className="admin-block">
        <h2>계약서</h2>
        {app.docToken ? (
          <p>
            <a href={`/api/partners/doc/${app.docToken}`} target="_blank" rel="noreferrer">
              PDF 열람
            </a>
            <span className="admin-muted"> hash {app.docHash?.slice(0, 12)}</span>
          </p>
        ) : (
          <p>문서 없음</p>
        )}
        <button type="button" className="contract-ghost" disabled={pending === "revoke"} onClick={() => void toggleRevoke()}>
          {app.docRevoked ? "문서 공개로 되돌리기" : "문서 폐기(doc_revoked)"}
        </button>
      </div>

      <div className="admin-block">
        <h2>동의 이력</h2>
        <ul>
          {(app.agreements || []).map((item) => (
            <li key={`${item.key}-${item.agreedAt}`}>
              {item.key} · {new Date(item.agreedAt).toLocaleString("ko-KR")}
            </li>
          ))}
          <li>privacyAgreed: {app.privacyAgreed ? "Y" : "N"}</li>
        </ul>
      </div>

      {canResolve ? (
        <div className="admin-block">
          <h2>수동 확인</h2>
          <label>
            empCode
            <input value={empCode} onChange={(e) => setEmpCode(e.target.value)} placeholder="TY 전산에서 확인한 코드" />
          </label>
          <label>
            메모
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </label>
          {error ? <p className="partner-apply-alert">{error}</p> : null}
          <div className="issue-modal-actions">
            <button
              type="button"
              className="btn-apply"
              disabled={!empCode || Boolean(pending)}
              onClick={() => void resolve("already_issued")}
            >
              {pending === "already_issued" ? "저장 중..." : "이미 등록됨"}
            </button>
            <button type="button" className="contract-ghost" disabled={Boolean(pending)} onClick={() => void resolve("retry")}>
              {pending === "retry" ? "재시도 중..." : "미등록 — 재시도"}
            </button>
          </div>
        </div>
      ) : error ? (
        <p className="partner-apply-alert">{error}</p>
      ) : null}

      <div className="admin-block">
        <h2>감사로그</h2>
        <ol className="admin-timeline">
          {initial.logs.map((log) => (
            <li key={log.id}>
              <strong>{log.event}</strong>
              <span>{new Date(log.created_at).toLocaleString("ko-KR")}</span>
              <pre>{JSON.stringify(log.meta, null, 2)}</pre>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
