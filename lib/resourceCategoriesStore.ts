import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { sanitizeCategoryName, type ResourceCategory } from "@/lib/resources";
import { getBlobJson, putBlobFile } from "@/lib/blobStore";

const INDEX_PATH = path.join(process.cwd(), "data", "resource-categories.json");
const BLOB_INDEX = "resources/categories.json";

type ResourceCategoryState = {
  showAll: boolean;
  items: ResourceCategory[];
  order: string[];
};

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function normalizeState(value: unknown): ResourceCategoryState {
  const legacyItems = Array.isArray(value) ? value : null;
  const stored = !legacyItems && value && typeof value === "object" ? (value as Partial<ResourceCategoryState>) : null;
  const items = legacyItems || stored?.items;
  const normalizedItems = Array.isArray(items) ? items.filter((item) => item?.id && item?.name) : [];
  const showAll = stored?.showAll !== false;
  const allowed = new Set(normalizedItems.map((item) => item.id));
  if (showAll) allowed.add("all");
  const storedOrder = Array.isArray(stored?.order) ? stored.order : [];
  const order = [...new Set(storedOrder)].filter((id) => allowed.has(id));
  for (const id of allowed) if (!order.includes(id)) order.push(id);
  return { showAll, items: normalizedItems, order };
}

async function readLocal(): Promise<ResourceCategoryState> {
  try {
    const raw = await readFile(INDEX_PATH, "utf8");
    return normalizeState(JSON.parse(raw) as unknown);
  } catch {
    return { showAll: true, items: [], order: ["all"] };
  }
}

async function writeLocal(state: ResourceCategoryState) {
  await mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await writeFile(INDEX_PATH, JSON.stringify(state, null, 2));
}

async function readBlob(): Promise<ResourceCategoryState> {
  return normalizeState(await getBlobJson<unknown>(BLOB_INDEX));
}

async function writeBlob(state: ResourceCategoryState) {
  await putBlobFile(BLOB_INDEX, JSON.stringify(state), {
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

async function readAll() {
  return blobEnabled() ? await readBlob() : await readLocal();
}

async function writeAll(state: ResourceCategoryState) {
  if (blobEnabled()) await writeBlob(state);
  else await writeLocal(state);
}

export async function getResourceCategories() {
  const state = await readAll();
  const byId = new Map(state.items.map((item) => [item.id, item]));
  return state.order.filter((id) => id !== "all").map((id) => byId.get(id)).filter(Boolean) as ResourceCategory[];
}

export async function getResourceCategoryState() {
  const state = await readAll();
  const byId = new Map(state.items.map((item) => [item.id, item]));
  return {
    ...state,
    items: state.order.filter((id) => id !== "all").map((id) => byId.get(id)).filter(Boolean) as ResourceCategory[],
  };
}

export async function addResourceCategory(name: string) {
  const sanitized = sanitizeCategoryName(name);
  if (!sanitized) return { error: "분류 이름은 1~20자로 입력해 주세요." as const, item: null };
  const state = await readAll();
  if (state.items.some((item) => item.name.toLowerCase() === sanitized.toLowerCase())) {
    return { error: "이미 있는 분류입니다." as const, item: null };
  }
  const item: ResourceCategory = {
    id: crypto.randomUUID(),
    name: sanitized,
    createdAt: new Date().toISOString(),
  };
  await writeAll({ ...state, items: [...state.items, item], order: [...state.order, item.id] });
  return { error: null, item };
}

export async function removeResourceCategory(id: string) {
  const state = await readAll();
  if (id === "all") {
    if (!state.showAll) return null;
    await writeAll({ ...state, showAll: false, order: state.order.filter((row) => row !== "all") });
    return { id: "all", name: "전체", createdAt: "" } satisfies ResourceCategory;
  }
  const target = state.items.find((item) => item.id === id);
  if (!target) return null;
  await writeAll({
    ...state,
    items: state.items.filter((item) => item.id !== id),
    order: state.order.filter((row) => row !== id),
  });
  return target;
}

export async function reorderResourceCategories(ids: string[]) {
  const state = await readAll();
  const allowed = new Set(state.items.map((item) => item.id));
  if (state.showAll) allowed.add("all");
  const unique = [...new Set(ids)].filter((id) => allowed.has(id));
  if (unique.length !== allowed.size) return null;
  const byId = new Map(state.items.map((item) => [item.id, item]));
  const items = unique.filter((id) => id !== "all").map((id) => byId.get(id)).filter(Boolean) as ResourceCategory[];
  await writeAll({ showAll: state.showAll, items, order: unique });
  return { showAll: state.showAll, items, order: unique };
}
