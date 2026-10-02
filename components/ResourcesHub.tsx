"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ResourceCategoryIcon } from "@/components/resourceCategoryIcons";
import type { ResourceCategory } from "@/lib/resources";

export default function ResourcesHub() {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loginRequired, setLoginRequired] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/resources/categories", { cache: "no-store" });
      if (res.status === 401) {
        setLoginRequired(true);
        setLoaded(true);
        return;
      }
      const data = (await res.json()) as { items?: ResourceCategory[] };
      setCategories(data.items || []);
      setLoaded(true);
    })();
  }, []);

  if (!loaded) {
    return <div className="resource-hub" aria-busy="true" />;
  }

  if (loginRequired) {
    return (
      <div className="resource-hub">
        <div className="resource-gate resource-gate-inline">
          <p>로그인 후 자료실을 확인할 수 있습니다.</p>
          <Link href="/login?next=/resources" className="btn-apply">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-hub">
      <div className="resource-hub-grid">
        {categories.map((item) => (
          <Link
            key={item.id}
            href={`/resources?cat=${encodeURIComponent(item.name)}`}
            className="resource-hub-card"
          >
            <ResourceCategoryIcon name={item.name} />
            <span className="resource-hub-card-label">{item.name}</span>
          </Link>
        ))}
      </div>
      {categories.length ? (
        <p className="resource-hub-all">
          <Link href="/resources?cat=_all">전체 자료 보기 →</Link>
        </p>
      ) : (
        <p className="resource-empty">등록된 분류가 없습니다.</p>
      )}
    </div>
  );
}
