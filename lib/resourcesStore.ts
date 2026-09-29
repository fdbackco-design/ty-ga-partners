import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import {
  type ResourcePost,
  encodeResourcePathSegment,
  isSafeResourceBlobPath,
  normalizeStoredResource,
  resourceStoredFilePath,
} from "@/lib/resources";
import { delBlobFile, getBlobJson, putBlobFile } from "@/lib/blobStore";

const INDEX_PATH = path.join(process.cwd(), "data", "resources.json");
const BLOB_INDEX = "resources/index.json";

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function normalizeList(items: ResourcePost[] | null | undefined) {
  return Array.isArray(items) ? items.map(normalizeStoredResource) : [];
}

async function readLocal(): Promise<ResourcePost[]> {
  try {
    const raw = await readFile(INDEX_PATH, "utf8");
    return normalizeList(JSON.parse(raw) as ResourcePost[]);
  } catch {
    return [];
  }
}

async function writeLocal(items: ResourcePost[]) {
  await mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await writeFile(INDEX_PATH, JSON.stringify(items, null, 2));
}

async function readBlob(): Promise<ResourcePost[]> {
  return normalizeList(await getBlobJson<ResourcePost[]>(BLOB_INDEX));
}

async function writeBlob(items: ResourcePost[]) {
  await putBlobFile(BLOB_INDEX, JSON.stringify(items), {
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

export async function getResources() {
  const items = useBlob() ? await readBlob() : await readLocal();
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getResource(id: string) {
  return (await getResources()).find((item) => item.id === id) ?? null;
}

export async function saveResource(item: ResourcePost) {
  const normalized = normalizeStoredResource(item);
  const items = useBlob() ? await readBlob() : await readLocal();
  const next = [normalized, ...items.filter((row) => row.id !== normalized.id)];
  if (useBlob()) await writeBlob(next);
  else await writeLocal(next);
  return normalized;
}

async function deleteStoredFile(url: string) {
  const pathname = resourceStoredFilePath(url);
  if (isSafeResourceBlobPath(pathname)) {
    try {
      await delBlobFile(pathname);
    } catch {
      // ignore missing blob
    }
    return;
  }
  if (pathname.startsWith("uploads/resources/")) {
    try {
      await unlink(path.join(process.cwd(), "public", pathname));
    } catch {
      // ignore missing file
    }
  }
}

export async function removeResource(id: string) {
  const items = useBlob() ? await readBlob() : await readLocal();
  const target = items.find((item) => item.id === id);
  if (!target) return null;
  const next = items.filter((item) => item.id !== id);
  if (useBlob()) await writeBlob(next);
  else await writeLocal(next);
  const urls = [...target.files.map((file) => file.url), target.fileUrl].filter(Boolean);
  await Promise.all([...new Set(urls)].map((url) => deleteStoredFile(url)));
  return target;
}

export async function saveLocalFile(id: string, fileName: string, buffer: Buffer) {
  const dir = path.join(process.cwd(), "public", "uploads", "resources", id);
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  await writeFile(filePath, buffer);
  return `/uploads/resources/${id}/${encodeResourcePathSegment(fileName)}`;
}

export function usingBlob() {
  return useBlob();
}
