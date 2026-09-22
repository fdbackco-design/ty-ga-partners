"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CHANNELS } from "@/config/channels";

type Row = {
  id: string;
  status: string;
  name: string | null;
  empId: string;
  empCode: string | null;
  orgCode: string;
  joinChannel: string;
  channelSlug: string;
  issuedAt: string | null;
  signedAt: string | null;
  updatedAt: string;
  lastErrorMessage: string | null;
};

const STATUSES = [
  "",
  "CONTRACT_SIGNED",
  "SUBMITTING",
  "ISSUED",
  "FAILED",
  "NEEDS_MANUAL_CHECK",
];

export default function PartnerAdminList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState("");
  const [channel, setChannel] = useState("");
  const [q, setQ] = useState("");
  const [manual, setManual] = useState(true);
  const [error, setError] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (manual) params.set("manual", "1");
    else if (status) params.set("status", status);
    if (channel) params.set("channel", channel);
    if (q.trim()) params.set("q", q.trim());
    return params.toString();
  }, [status, channel, q, manual]);

  useEffect(() => {
    let alive = true;
    void fetch(`/api/admin/partners?${query}`, { cache: "no-store" })
      .then(async (res) => {
        const data = (await res.json()) as { applications?: Row[]; error?: string };
        if (!alive) return;
        if (!res.ok) {
          setError(data.error || "목록을 불러오지 못했습니다.");
          setRows([]);
          return;
        }
        setError("");
        setRows(data.applications || []);
      })
      .catch(() => {
        if (alive) setError("목록을 불러오지 못했습니다.");
      });
    return () => {
      alive = false;
    };
  }, [query]);

  return (
    <div className="admin-partners">
      <div className="admin-filters">
        <label>
          <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />
          수동 확인 큐만
        </label>
        <select value={status} disabled={manual} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((item) => (
            <option key={item || "all"} value={item}>
              {item || "전체 상태"}
            </option>
          ))}
        </select>
        <select value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="">전체 채널</option>
          {Object.values(CHANNELS).map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.label}
            </option>
          ))}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름 / 아이디 / 코드" />
      </div>
      {error ? <p className="partner-apply-alert">{error}</p> : null}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>상태</th>
              <th>성명</th>
              <th>아이디</th>
              <th>코드</th>
              <th>채널</th>
              <th>갱신</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>해당하는 신청이 없습니다.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/admin/partners/${row.id}`}>{row.status}</Link>
                  </td>
                  <td>{row.name || "-"}</td>
                  <td>{row.empId || "-"}</td>
                  <td>{row.empCode || "-"}</td>
                  <td>{row.joinChannel}</td>
                  <td>{new Date(row.updatedAt).toLocaleString("ko-KR")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
