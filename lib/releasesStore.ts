import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  normalizeStoredRelease,
  type ReleaseRequest,
  type ReleaseStatus,
} from "@/lib/releases";
import { getBlobJson, putBlobFile } from "@/lib/blobStore";

const INDEX_PATH = path.join(process.cwd(), "data", "releases.json");
const BLOB_INDEX = "releases/index.json";

const BLOB_PUT = {
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json",
  cacheControlMaxAge: 60,
} as const;

export function usingBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function normalizeList(items: ReleaseRequest[] | null | undefined) {
  return Array.isArray(items) ? items.filter((item) => item?.id).map(normalizeStoredRelease) : [];
}

async function readLocal(): Promise<ReleaseRequest[]> {
  try {
    const raw = await readFile(INDEX_PATH, "utf8");
    return normalizeList(JSON.parse(raw) as ReleaseRequest[]);
  } catch {
    return [];
  }
}

async function writeLocal(items: ReleaseRequest[]) {
  await mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await writeFile(INDEX_PATH, JSON.stringify(items, null, 2));
}

async function readBlob(): Promise<ReleaseRequest[]> {
  return normalizeList(await getBlobJson<ReleaseRequest[]>(BLOB_INDEX));
}

async function writeBlob(items: ReleaseRequest[]) {
  await putBlobFile(BLOB_INDEX, JSON.stringify(items), BLOB_PUT);
}

async function readAll() {
  return usingBlob() ? await readBlob() : await readLocal();
}

async function writeAll(items: ReleaseRequest[]) {
  if (usingBlob()) await writeBlob(items);
  else await writeLocal(items);
}

export async function getReleases() {
  const items = await readAll();
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addRelease(input: { name: string; phone: string; memo: string; userId?: string | null }) {
  const now = new Date().toISOString();
  const item: ReleaseRequest = {
    id: crypto.randomUUID(),
    userId: input.userId || null,
    name: input.name,
    phone: input.phone,
    memo: input.memo,
    privacyAgreed: true,
    status: "RECEIVED",
    createdAt: now,
    updatedAt: now,
  };
  const items = await readAll();
  await writeAll([item, ...items]);
  return item;
}

export async function getReleasesByUserId(userId: string) {
  if (!userId) return [] as ReleaseRequest[];
  return (await getReleases()).filter((item) => item.userId === userId);
}

export async function findReleaseById(id: string) {
  return (await readAll()).find((item) => item.id === id) ?? null;
}

export async function updateReleaseStatus(id: string, status: ReleaseStatus) {
  const items = await readAll();
  const current = items.find((item) => item.id === id);
  if (!current) return null;
  const next = items.map((item) =>
    item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
  );
  await writeAll(next);
  return next.find((item) => item.id === id) || null;
}

export async function removeRelease(id: string) {
  const items = await readAll();
  const current = items.find((item) => item.id === id) ?? null;
  if (!current) return null;
  await writeAll(items.filter((item) => item.id !== id));
  return current;
}
