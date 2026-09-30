"use client";

import { useEffect, useState } from "react";
import { formatPhoneDisplay } from "@/lib/auth";
import { isGuestRelease, releaseStatusLabel, type ReleaseRequest, type ReleaseStatus } from "@/lib/releases";

export default function ReleaseAdminList() {
  const [rows, setRows] = useState<ReleaseRequest[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");

  async function load() {
    const res = await fetch("/api/admin/releases", { cache: "no-store" });
    const data = (await res.json()) as { items?: ReleaseRequest[]; error?: string };
    if (!res.ok) {
      setError(data.error || "목록을 불러오지 못했습니다.");
      setRows([]);
      return;
    }
    setError("");
    setRows(data.items || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function setStatus(id: string, status: ReleaseStatus) {
    setPending(`${id}-${status}`);
    setError("");
    const res = await fetch(`/api/admin/releases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = (await res.json()) as { error?: string };
    setPending("");
    if (!res.ok) {
      setError(data.error || "상태를 바꾸지 못했습니다.");
      return;
    }
    await load();
  }

  async function onDelete(id: string) {
    if (!confirm("이 해촉 신청을 삭제할까요?")) return;
    setPending(`${id}-delete`);
    setError("");
    const res = await fetch(`/api/admin/releases/${id}`, { method: "DELETE" });
    const data = (await res.json()) as { error?: string };
    setPending("");
    if (!res.ok) {
      setError(data.error || "삭제에 실패했습니다.");
      return;
    }
    await load();
  }

  return (
    <div className="admin-partners">
      {error ? <p className="partner-apply-alert">{error}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>상태</th>
              <th>이름</th>
              <th>전화번호</th>
              <th>요청 내용</th>
              <th>접수일</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>접수된 해촉 신청이 없습니다.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{releaseStatusLabel(row.status)}</td>
                  <td>
                    <span className="admin-name-cell">
                      {isGuestRelease(row) ? <span className="inquiry-lock">미로그인</span> : null}
                      {row.name}
                    </span>
                  </td>
                  <td>{row.phone ? formatPhoneDisplay(row.phone) : "-"}</td>
                  <td className="admin-memo">{row.memo || "-"}</td>
                  <td>{new Date(row.createdAt).toLocaleString("ko-KR")}</td>
                  <td>
                    <div className="inquiry-detail-actions">
                      {row.status === "RECEIVED" ? (
                        <button
                          type="button"
                          className="inquiry-edit-btn"
                          disabled={pending.startsWith(row.id)}
                          onClick={() => void setStatus(row.id, "DONE")}
                        >
                          처리완료
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="inquiry-edit-btn"
                          disabled={pending.startsWith(row.id)}
                          onClick={() => void setStatus(row.id, "RECEIVED")}
                        >
                          접수로
                        </button>
                      )}
                      <button
                        type="button"
                        className="resource-delete-btn"
                        disabled={pending.startsWith(row.id)}
                        onClick={() => void onDelete(row.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
