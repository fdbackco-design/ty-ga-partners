import type { ResourceCategory } from "@/lib/resources";

/** 자료실 허브 기본 분류 (순서 고정) */
export const DEFAULT_RESOURCE_CATEGORY_NAMES = [
  "브로슈어",
  "홍보영상",
  "교육영상",
  "자주묻는질문",
  "전산이용방법",
] as const;

const DEFAULT_IDS = [
  "d1c0b001-0001-4000-8000-000000000001",
  "d1c0b001-0002-4000-8000-000000000002",
  "d1c0b001-0003-4000-8000-000000000003",
  "d1c0b001-0004-4000-8000-000000000004",
  "d1c0b001-0005-4000-8000-000000000005",
] as const;

export function buildDefaultResourceCategoryState(createdAt = new Date().toISOString()) {
  const items: ResourceCategory[] = DEFAULT_RESOURCE_CATEGORY_NAMES.map((name, index) => ({
    id: DEFAULT_IDS[index],
    name,
    createdAt,
  }));
  return {
    showAll: true,
    items,
    order: ["all", ...items.map((item) => item.id)],
  };
}
