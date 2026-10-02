import { describe, expect, it } from "vitest";
import { buildDefaultResourceCategoryState, DEFAULT_RESOURCE_CATEGORY_NAMES } from "./resourceDefaultCategories";

describe("buildDefaultResourceCategoryState", () => {
  it("예시와 같은 5개 기본 분류를 만든다", () => {
    const state = buildDefaultResourceCategoryState("2026-10-02T00:00:00.000Z");
    expect(state.items.map((item) => item.name)).toEqual([...DEFAULT_RESOURCE_CATEGORY_NAMES]);
    expect(state.showAll).toBe(true);
    expect(state.order[0]).toBe("all");
    expect(state.order).toHaveLength(6);
  });
});
