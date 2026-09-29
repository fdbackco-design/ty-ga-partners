import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { list } from "@vercel/blob";
import { type Inquiry, normalizeStoredInquiry } from "@/lib/inquiries";
import { delBlobFile, getBlobJson, putBlobFile } from "@/lib/blobStore";

const INDEX_PATH = path.join(process.cwd(), "data", "inquiries.json");
const BLOB_INDEX = "inquiries/index.json";
const BLOB_ITEM_PREFIX = "inquiries/items/";

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

function mergeInquiries(primary: Inquiry[], secondary: Inquiry[]) {
  const map = new Map<string, Inquiry>();
  for (const item of secondary) map.set(item.id, item);
  for (const item of primary) map.set(item.id, item);
  return [...map.values()];
}

async function readLocal(): Promise<Inquiry[]> {
  try {
    const raw = await readFile(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw) as Inquiry[];
    return Array.isArray(parsed) ? parsed.map(normalizeStoredInquiry) : [];
  } catch {
    return [];
  }
}

async function writeLocal(items: Inquiry[]) {
  await mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await writeFile(INDEX_PATH, JSON.stringify(items, null, 2));
}

async function readBlobIndex(): Promise<Inquiry[]> {
  const parsed = await getBlobJson<Inquiry[]>(BLOB_INDEX);
  return Array.isArray(parsed) ? parsed.map(normalizeStoredInquiry) : [];
}

async function readBlobItems(): Promise<Inquiry[]> {
  const items: Inquiry[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: BLOB_ITEM_PREFIX, cursor, limit: 1000 });
    for (const file of page.blobs) {
      if (!file.pathname.endsWith(".json")) continue;
      const parsed = await getBlobJson<Inquiry>(file.pathname);
      if (parsed && parsed.id) items.push(normalizeStoredInquiry(parsed));
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return items;
}

async function readBlob(): Promise<Inquiry[]> {
  const [fromItems, fromIndex] = await Promise.all([readBlobItems(), readBlobIndex()]);
  return mergeInquiries(fromItems, fromIndex);
}

async function writeBlobIndex(items: Inquiry[]) {
  await putBlobFile(BLOB_INDEX, JSON.stringify(items), BLOB_PUT);
}

async function writeBlobItem(item: Inquiry) {
  await putBlobFile(itemPath(item.id), JSON.stringify(item), BLOB_PUT);
}

export async function getInquiries() {
  const items = useBlob() ? await readBlob() : await readLocal();
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getInquiry(id: string) {
  if (useBlob()) {
    const parsed = await getBlobJson<Inquiry>(itemPath(id));
    if (parsed && parsed.id) return normalizeStoredInquiry(parsed);
  }
  return (await getInquiries()).find((item) => item.id === id) ?? null;
}

export async function saveInquiry(item: Inquiry) {
  if (useBlob()) {
    await writeBlobItem(item);
    try {
      const next = [item, ...(await readBlob()).filter((row) => row.id !== item.id)];
      await writeBlobIndex(next);
    } catch (error) {
      console.error("[inquiries] 목록 인덱스 갱신 실패", error);
    }
    return item;
  }
  const items = await readLocal();
  const next = [item, ...items.filter((row) => row.id !== item.id)];
  await writeLocal(next);
  return item;
}

export async function removeInquiry(id: string) {
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

export async function saveLocalInquiryFile(id: string, fileName: string, buffer: Buffer) {
  const dir = path.join(process.cwd(), "public", "uploads", "inquiries", id);
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  await writeFile(filePath, buffer);
  return `/uploads/inquiries/${id}/${encodeURIComponent(fileName)}`;
}

export function usingBlob() {
  return useBlob();
}
