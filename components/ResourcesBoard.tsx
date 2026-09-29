"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  fileKindLabel,
  resourceExcerpt,
  resourceHasVideo,
  type ResourceCategory,
  type ResourcePost,
} from "@/lib/resources";

export default function ResourcesBoard() {
  const { ready, isAdmin, user } = useAuth();
  const [items, setItems] = useState<ResourcePost[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [canDownload, setCanDownload] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  async function load() {
    const res = await fetch("/api/resources", { cache: "no-store" });
    const data = (await res.json()) as {
      items?: ResourcePost[];
      categories?: ResourceCategory[];
      loginRequired?: boolean;
      canDownload?: boolean;
    };
    setItems(data.items || []);
    setCategories(data.categories || []);
    setLoginRequired(Boolean(data.loginRequired));
    setCanDownload(Boolean(data.canDownload));
    setLoaded(true);
  }

  useEffect(() => {
    if (!ready) return;
    setLoaded(false);
    setItems([]);
    void load();
  }, [ready, isAdmin, user?.username]);

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

  const filterNames = useMemo(() => {
    const names = new Set(categories.map((item) => item.name));
    for (const item of items) if (item.category) names.add(item.category);
    return [...names];
  }, [categories, items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category && item.category !== category) return false;
      if (!q) return true;
      const excerpt = resourceExcerpt(item.content).toLowerCase();
      return item.title.toLowerCase().includes(q) || excerpt.includes(q) || item.category.toLowerCase().includes(q);
    });
  }, [items, query, category]);

  if (!loaded) {
    return <section className="resource-board" />;
  }

  if (loginRequired) {
    return (
      <section className="resource-board">
        <div className="resource-gate">
          <p>로그인 후 자료실을 확인할 수 있습니다.</p>
          <Link href="/login?next=/resources" className="btn-apply">
            로그인
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="resource-board">
      {loaded && !canDownload ? (
        <div className="resource-issue-bar">
          <div className="resource-issue-bar-copy">
            <strong>자료 다운로드 안내</strong>
            <p>영상·자료 조회 및 다운로드는 사원코드 발급 후 이용할 수 있습니다.</p>
          </div>
          <Link href="/partners/apply" className="resource-issue-bar-cta">
            사원코드 무료 발급 →
          </Link>
        </div>
      ) : null}

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

      {filterNames.length ? (
        <div className="resource-category-filters" role="tablist" aria-label="자료 분류">
          <button type="button" className={category ? "" : "is-active"} onClick={() => setCategory("")}>
            전체
          </button>
          {filterNames.map((name) => (
            <button
              key={name}
              type="button"
              className={category === name ? "is-active" : ""}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}

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
                      {item.category ? <span className="resource-category-badge">{item.category}</span> : null}
                      {resourceHasVideo(item) ? <span className="resource-video-badge">영상</span> : null}
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
