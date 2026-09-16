"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { isPlayableVideo, resourceExcerpt, type ResourcePost } from "@/lib/resources";

function fileKindLabel(item: ResourcePost) {
  if (!item.fileUrl && !item.fileName) return "";
  if (isPlayableVideo(item.fileName)) return "영상";
  const ext = item.fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return ext || "첨부";
}

export default function ResourcesBoard() {
  const { ready, isAdmin } = useAuth();
  const [items, setItems] = useState<ResourcePost[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");

  async function load() {
    const res = await fetch("/api/resources", { cache: "no-store" });
    const data = (await res.json()) as { items?: ResourcePost[] };
    setItems(data.items || []);
    setLoaded(true);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onDelete(id: string) {
    if (!confirm("이 자료를 삭제할까요?")) return;
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      setError(json.error || "삭제에 실패했습니다.");
      return;
    }
    await load();
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const excerpt = resourceExcerpt(item.content).toLowerCase();
      return item.title.toLowerCase().includes(q) || excerpt.includes(q);
    });
  }, [items, query]);

  return (
    <section className="resource-board">
      <div className="resource-board-bar">
        <p className="resource-board-count">총 {items.length}개 자료</p>
        <div className="resource-board-tools">
          <label className="resource-board-search">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="자료 검색"
              aria-label="자료 검색"
            />
          </label>
          {ready && isAdmin ? (
            <div className="resource-toolbar">
              <Link href="/resources/new" className="resource-board-write">
                글 작성
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-[#dc3545]">{error}</p> : null}

      {!loaded ? null : items.length === 0 ? (
        <p className="resource-empty">등록된 자료가 없습니다.</p>
      ) : visible.length === 0 ? (
        <p className="resource-empty">검색 결과가 없습니다.</p>
      ) : (
        <ul className="resource-board-list">
          {visible.map((item) => {
            const excerpt = resourceExcerpt(item.content);
            const fileLabel = fileKindLabel(item);
            return (
              <li key={item.id} className="resource-board-item">
                <Link href={`/resources/${item.id}`} className="resource-board-link">
                  <div className="resource-board-copy">
                    <strong>
                      {item.title}
                      {isPlayableVideo(item.fileName) ? <span className="resource-video-badge">영상</span> : null}
                    </strong>
                    {excerpt ? <em>{excerpt}</em> : null}
                  </div>
                  <time className="resource-board-date" dateTime={item.createdAt}>
                    {item.createdAt.slice(0, 10)}
                  </time>
                  {fileLabel ? <span className="resource-board-file">{fileLabel}</span> : <span />}
                  <span className="resource-board-arrow" aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
                {isAdmin ? (
                  <button type="button" className="resource-delete" onClick={() => onDelete(item.id)}>
                    삭제
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
