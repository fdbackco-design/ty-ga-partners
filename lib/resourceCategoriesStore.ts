import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { sanitizeCategoryName, type ResourceCategory } from "@/lib/resources";
import { getBlobJson, putBlobFile } from "@/lib/blobStore";

const INDEX_PATH = path.join(process.cwd(), "data", "resource-categories.json");
const BLOB_INDEX = "resources/categories.json";

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readLocal(): Promise<ResourceCategory[]> {
  try {
    const raw = await readFile(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw) as ResourceCategory[];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.name) : [];
  } catch {
    return [];
  }
}

async function writeLocal(items: ResourceCategory[]) {
  await mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await writeFile(INDEX_PATH, JSON.stringify(items, null, 2));
}

async function readBlob(): Promise<ResourceCategory[]> {
  const parsed = await getBlobJson<ResourceCategory[]>(BLOB_INDEX);
  return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.name) : [];
}

async function writeBlob(items: ResourceCategory[]) {
  await putBlobFile(BLOB_INDEX, JSON.stringify(items), {
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

async function readAll() {
  return useBlob() ? await readBlob() : await readLocal();
}

async function writeAll(items: ResourceCategory[]) {
  if (useBlob()) await writeBlob(items);
  else await writeLocal(items);
}

export async function getResourceCategories() {
  const items = await readAll();
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export async function addResourceCategory(name: string) {
  const sanitized = sanitizeCategoryName(name);
  if (!sanitized) return { error: "분류 이름은 1~20자로 입력해 주세요." as const, item: null };
  const items = await readAll();
  if (items.some((item) => item.name.toLowerCase() === sanitized.toLowerCase())) {
    return { error: "이미 있는 분류입니다." as const, item: null };
  }
  const item: ResourceCategory = {
    id: crypto.randomUUID(),
    name: sanitized,
    createdAt: new Date().toISOString(),
  };
  await writeAll([...items, item]);
  return { error: null, item };
}

export async function removeResourceCategory(id: string) {
  const items = await readAll();
  const target = items.find((item) => item.id === id);
  if (!target) return null;
  await writeAll(items.filter((item) => item.id !== id));
  return target;
}
