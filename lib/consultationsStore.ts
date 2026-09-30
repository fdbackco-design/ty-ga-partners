import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { list } from "@vercel/blob";
import { type Consultation, normalizeStoredConsultation } from "@/lib/consultations";
import { delBlobFile, getBlobJson, putBlobFile } from "@/lib/blobStore";

const INDEX_PATH = path.join(process.cwd(), "data", "consultations.json");
const BLOB_INDEX = "consultations/index.json";
const BLOB_ITEM_PREFIX = "consultations/items/";

const BLOB_PUT = {
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json",
  cacheControlMaxAge: 60,
} as const;

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function itemPath(id: string) {
  return `${BLOB_ITEM_PREFIX}${id}.json`;
}

function mergeConsultations(primary: Consultation[], secondary: Consultation[]) {
  const map = new Map<string, Consultation>();
  for (const item of secondary) map.set(item.id, item);
  for (const item of primary) map.set(item.id, item);
  return [...map.values()];
}

async function readLocal(): Promise<Consultation[]> {
  try {
    const raw = await readFile(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw) as Consultation[];
    return Array.isArray(parsed) ? parsed.map(normalizeStoredConsultation) : [];
  } catch {
    return [];
  }
}

async function writeLocal(items: Consultation[]) {
  await mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await writeFile(INDEX_PATH, JSON.stringify(items, null, 2));
}

async function readBlobIndex(): Promise<Consultation[]> {
  const parsed = await getBlobJson<Consultation[]>(BLOB_INDEX);
  return Array.isArray(parsed) ? parsed.map(normalizeStoredConsultation) : [];
}

async function readBlobItems(): Promise<Consultation[]> {
  const items: Consultation[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: BLOB_ITEM_PREFIX, cursor, limit: 1000 });
    for (const file of page.blobs) {
      if (!file.pathname.endsWith(".json")) continue;
      const parsed = await getBlobJson<Consultation>(file.pathname);
      if (parsed && parsed.id) items.push(normalizeStoredConsultation(parsed));
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return items;
}

async function readBlob(): Promise<Consultation[]> {
  const [fromItems, fromIndex] = await Promise.all([readBlobItems(), readBlobIndex()]);
  return mergeConsultations(fromItems, fromIndex);
}

async function writeBlobIndex(items: Consultation[]) {
  await putBlobFile(BLOB_INDEX, JSON.stringify(items), BLOB_PUT);
}

async function writeBlobItem(item: Consultation) {
  await putBlobFile(itemPath(item.id), JSON.stringify(item), BLOB_PUT);
}

export async function getConsultations() {
  const items = useBlob() ? await readBlob() : await readLocal();
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getConsultation(id: string) {
  if (useBlob()) {
    const parsed = await getBlobJson<Consultation>(itemPath(id));
    if (parsed && parsed.id) return normalizeStoredConsultation(parsed);
  }
  return (await getConsultations()).find((item) => item.id === id) ?? null;
}

export async function saveConsultation(item: Consultation) {
  if (useBlob()) {
    await writeBlobItem(item);
    try {
      const next = [item, ...(await readBlob()).filter((row) => row.id !== item.id)];
      await writeBlobIndex(next);
    } catch (error) {
      console.error("[consultations] 목록 인덱스 갱신 실패", error);
    }
    return item;
  }
  const items = await readLocal();
  const next = [item, ...items.filter((row) => row.id !== item.id)];
  await writeLocal(next);
  return item;
}

export async function removeConsultation(id: string) {
  if (useBlob()) {
    const items = await readBlob();
    const item = items.find((row) => row.id === id) ?? null;
    await delBlobFile(itemPath(id));
    await writeBlobIndex(items.filter((row) => row.id !== id));
    return item ?? true;
  }
  const items = await readLocal();
  const item = items.find((row) => row.id === id) ?? null;
  if (!item) return null;
  await writeLocal(items.filter((row) => row.id !== id));
  return item;
}
