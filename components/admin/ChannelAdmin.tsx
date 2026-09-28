"use client";

import { FormEvent, useEffect, useState } from "react";
import { DEFAULT_CHANNEL_SLUG } from "@/config/channels";

type ChannelRow = {
  id?: string;
  name: string;
  slug: string;
  active: boolean;
  url: string;
};

export default function ChannelAdmin() {
  const [rows, setRows] = useState<ChannelRow[]>([]);
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  const [copied, setCopied] = useState("");
  const [createdUrl, setCreatedUrl] = useState("");
  const editing = Boolean(editingId);
  const editingDefault = editing && slug === DEFAULT_CHANNEL_SLUG;

  async function load() {
    const res = await fetch("/api/admin/channels", { cache: "no-store" });
    let data: { channels?: ChannelRow[]; error?: string } = {};
    try {
      data = (await res.json()) as { channels?: ChannelRow[]; error?: string };
    } catch {
      data = { error: "채널 목록을 불러오지 못했습니다." };
    }
    if (!res.ok) {
      setError(data.error || "채널 목록을 불러오지 못했습니다.");
      setRows([]);
      return;
    }
    setError("");
    setRows(data.channels || []);
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setEditingId("");
    setName("");
    setSlug("");
    setActive(true);
  }

  function startEdit(row: ChannelRow) {
    if (!row.id) return;
    setError("");
    setCreatedUrl("");
    setEditingId(row.id);
    setName(row.name);
    setSlug(row.slug);
    setActive(row.active);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(editing ? "save" : "create");
    setError("");
    setCreatedUrl("");
    const res = await fetch(editing ? `/api/admin/channels/${editingId}` : "/api/admin/channels", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, active }),
    });
    const data = (await res.json()) as { channel?: ChannelRow; error?: string };
    setPending("");
    if (!res.ok || !data.channel) {
      setError(data.error || (editing ? "채널을 수정하지 못했습니다." : "채널을 만들지 못했습니다."));
      return;
    }
    if (editing) {
      setRows((prev) => prev.map((item) => (item.id === data.channel!.id ? data.channel! : item)));
      resetForm();
      return;
    }
    resetForm();
    setCreatedUrl(data.channel.url);
    setRows((prev) => [...prev, data.channel!]);
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setError("URL을 복사하지 못했습니다.");
    }
  }

  async function toggleActive(row: ChannelRow) {
    if (!row.id) return;
    setError("");
    const res = await fetch(`/api/admin/channels/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !row.active }),
    });
    const data = (await res.json()) as { channel?: ChannelRow; error?: string };
    if (!res.ok || !data.channel) {
      setError(data.error || "채널 상태를 바꾸지 못했습니다.");
      return;
    }
    const updated = data.channel;
    setRows((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (editingId === updated.id) setActive(updated.active);
  }

  async function onDelete(row: ChannelRow) {
    if (!row.id) return;
    if (!confirm(`${row.name} 채널을 삭제할까요? 가입 URL은 더 이상 사용할 수 없습니다.`)) return;
    setPending(`delete:${row.id}`);
    setError("");
    const res = await fetch(`/api/admin/channels/${row.id}`, { method: "DELETE" });
    const data = (await res.json()) as { error?: string };
    setPending("");
    if (!res.ok) {
      setError(data.error || "채널을 삭제하지 못했습니다.");
      return;
    }
    setRows((prev) => prev.filter((item) => item.id !== row.id));
    if (editingId === row.id) resetForm();
  }

  return (
    <div className="admin-channels">
      <form className="form-card admin-channel-form" onSubmit={(e) => void onSubmit(e)}>
        <div className="form-grid">
          <div>
            <label htmlFor="channelName">채널명</label>
            <input
              id="channelName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="TY_GA파트너스 채널2"
            />
          </div>
          <div>
            <label htmlFor="channelSlug">URL 파라미터 값</label>
            <input
              id="channelSlug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.trim())}
              placeholder="channel2"
              disabled={editingDefault}
            />
          </div>
        </div>
        <label className="admin-channel-active">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            disabled={editingDefault}
          />
          활성
        </label>
        <div className="admin-channel-form-actions">
          <button type="submit" className="btn-apply h-12 px-6" disabled={Boolean(pending)}>
            {pending === "save" ? "저장 중..." : pending === "create" ? "생성 중..." : editing ? "채널 저장" : "채널 생성"}
          </button>
          {editing ? (
            <button type="button" className="btn-ghost" disabled={Boolean(pending)} onClick={resetForm}>
              취소
            </button>
          ) : null}
        </div>
      </form>

      {createdUrl ? (
        <div className="admin-channel-created">
          <p>채널 가입 URL</p>
          <code>{createdUrl}</code>
          <button type="button" className="btn-ghost" onClick={() => void copyUrl(createdUrl)}>
            {copied === createdUrl ? "복사됨" : "URL 복사"}
          </button>
        </div>
      ) : null}

      {error ? <p className="partner-apply-alert">{error}</p> : null}

      <div className="admin-table-wrap mt-8">
        <table className="admin-table">
          <thead>
            <tr>
              <th>채널명</th>
              <th>파라미터</th>
              <th>상태</th>
              <th>가입 URL</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>등록된 채널이 없습니다.</td>
              </tr>
            ) : (
              rows.map((row) => {
                const isDefault = row.slug === DEFAULT_CHANNEL_SLUG;
                const deleting = pending === `delete:${row.id}`;
                return (
                  <tr key={row.slug} className={editingId && editingId === row.id ? "is-editing" : undefined}>
                    <td>{row.name}</td>
                    <td>{row.slug}</td>
                    <td>
                      {isDefault ? (
                        "활성"
                      ) : (
                        <button type="button" className="header-text-btn" onClick={() => void toggleActive(row)}>
                          {row.active ? "활성" : "비활성"}
                        </button>
                      )}
                    </td>
                    <td className="admin-channel-url">{row.url}</td>
                    <td>
                      <div className="admin-channel-actions">
                        <button type="button" className="btn-ghost" onClick={() => startEdit(row)} disabled={!row.id}>
                          수정
                        </button>
                        <button type="button" className="btn-ghost" onClick={() => void copyUrl(row.url)}>
                          {copied === row.url ? "복사됨" : "URL 복사"}
                        </button>
                        {isDefault ? null : (
                          <button
                            type="button"
                            className="resource-delete-btn"
                            onClick={() => void onDelete(row)}
                            disabled={!row.id || Boolean(pending)}
                          >
                            {deleting ? "삭제 중..." : "삭제"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
