"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  formatFileSize,
  resourceFileSrc,
  type ResourceCategory,
  type ResourcePost,
} from "@/lib/resources";

function fileExtLabel(fileName: string) {
  const ext = fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return ext || "FILE";
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 12.5 12 16.5 16 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function ResourcesCategoryList({ initialCat }: { initialCat: string }) {
  const router = useRouter();
  const { ready, isAdmin, partner } = useAuth();
  const [items, setItems] = useState<ResourcePost[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(true);
  const [canDownload, setCanDownload] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const allMode = initialCat === "_all";
  const [category, setCategory] = useState(allMode ? "" : initialCat);

  const fetchResources = useCallback(async () => {
    const res = await fetch("/api/resources", { cache: "no-store" });
    return (await res.json()) as {
      items?: ResourcePost[];
      categories?: ResourceCategory[];
      categoryOrder?: string[];
      showAllCategories?: boolean;
      loginRequired?: boolean;
      canDownload?: boolean;
    };
  }, []);

  const applyResources = useCallback(
    (data: Awaited<ReturnType<typeof fetchResources>>) => {
      const loadedItems = data.items || [];
      const loadedCategories = data.categories || [];
      const showAll = data.showAllCategories !== false;
      const order = data.categoryOrder || [...(showAll ? ["all"] : []), ...loadedCategories.map((item) => item.id)];
      setItems(loadedItems);
      setCategories(loadedCategories);
      setCategoryOrder(order);
      setShowAllCategories(showAll);
      setLoginRequired(Boolean(data.loginRequired));
      setCanDownload(Boolean(data.canDownload));
      setLoaded(true);
    },
    [],
  );

  useEffect(() => {
    if (!ready) return;
    void fetchResources().then(applyResources);
  }, [ready, isAdmin, partner?.issued, fetchResources, applyResources]);

  useEffect(() => {
    setCategory(allMode ? "" : initialCat);
  }, [allMode, initialCat]);

  const filterTabs = useMemo(() => {
    const byId = new Map(categories.map((item) => [item.id, item]));
    const tabs: { id: string; name: string; value: string }[] = [];
    for (const id of categoryOrder) {
      if (id === "all") {
        if (showAllCategories) tabs.push({ id, name: "전체", value: "" });
        continue;
      }
      const item = byId.get(id);
      if (!item) continue;
      tabs.push({ id, name: item.name, value: item.name });
    }
    for (const item of categories) {
      if (!tabs.some((tab) => tab.value === item.name)) {
        tabs.push({ id: item.id, name: item.name, value: item.name });
      }
    }
    return tabs;
  }, [categories, categoryOrder, showAllCategories]);

  const visible = useMemo(() => {
    return items.filter((item) => {
      if (category && item.category !== category) return false;
      return true;
    });
  }, [items, category]);

  const heading = category || (allMode ? "전체 자료" : initialCat);

  function selectCategory(value: string) {
    setCategory(value);
    if (!value) {
      router.replace("/resources?cat=_all");
      return;
    }
    router.replace(`/resources?cat=${encodeURIComponent(value)}`);
  }

  async function onDelete(id: string) {
    if (!confirm("이 자료를 삭제할까요?")) return;
    const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      setError(json.error || "삭제에 실패했습니다.");
      return;
    }
    applyResources(await fetchResources());
  }

  if (!loaded) {
    return <section className="resource-board resource-category-view" aria-busy="true" />;
  }

  if (loginRequired) {
    return (
      <section className="resource-board resource-category-view">
        <div className="resource-gate">
          <p>로그인 후 자료실을 확인할 수 있습니다.</p>
          <Link href={`/login?next=${encodeURIComponent(`/resources?cat=${encodeURIComponent(initialCat)}`)}`} className="btn-apply">
            로그인
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="resource-board resource-category-view">
      <p className="resource-category-crumb">
        <span className="resource-hub-eyebrow">RESOURCES</span>
        <span>
          {" "}
          / <Link href="/">홈</Link> / <Link href="/resources">자료실</Link>
          {heading ? <> / {heading}</> : null}
        </span>
      </p>
      <h1 className="resource-index-title resource-category-page-title">자료실</h1>
      <Link href="/resources" className="resource-category-back">
        ← 자료실 처음으로
      </Link>
      <div className="resource-category-head">
        <h2 className="resource-category-heading">{heading}</h2>
        {ready && isAdmin ? (
          <Link href="/resources/new" className="resource-board-write">
            글 작성
          </Link>
        ) : null}
      </div>

      {loaded && !canDownload && !partner?.issued && !isAdmin ? (
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

      {filterTabs.length ? (
        <div className="resource-category-filters" role="tablist" aria-label="자료 분류">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={category === tab.value ? "is-active" : ""}
              onClick={() => selectCategory(tab.value)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      ) : null}

      {error ? <p className="resource-category-error">{error}</p> : null}

      {visible.length === 0 ? (
        <p className="resource-empty">등록된 자료가 없습니다.</p>
      ) : (
        <ul className="resource-category-list">
          {visible.map((item) => {
            const file = item.files[0];
            const label = file ? fileExtLabel(file.name) : "자료";
            const meta = file
              ? `${label} · ${formatFileSize(file.size)} · ${item.createdAt.slice(0, 10)}`
              : item.createdAt.slice(0, 10);
            const downloadSrc = canDownload && file?.url ? resourceFileSrc(file.url) : "";
            return (
              <li key={item.id} className="resource-file-card resource-category-item">
                <span className="resource-list-file-badge">{label}</span>
                <div className="resource-file-copy">
                  <Link href={`/resources/${item.id}`}>
                    <strong>{item.title}</strong>
                  </Link>
                  <span>{meta}</span>
                </div>
                {downloadSrc ? (
                  <a
                    className="resource-file-download"
                    href={downloadSrc}
                    download={file.name}
                    aria-label={`${file.name} 내려받기`}
                  >
                    <DownloadIcon />
                    다운로드
                  </a>
                ) : (
                  <span className="resource-file-locked">다운로드 불가</span>
                )}
                {isAdmin ? (
                  <button type="button" className="resource-delete" onClick={() => void onDelete(item.id)}>
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
