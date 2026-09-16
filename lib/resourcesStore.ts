import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { del, list, put } from "@vercel/blob";
import { type ResourcePost, encodeResourcePathSegment } from "@/lib/resources";

const INDEX_PATH = path.join(process.cwd(), "data", "resources.json");
const BLOB_INDEX = "resources/index.json";

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readLocal(): Promise<ResourcePost[]> {
  try {
    const raw = await readFile(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw) as ResourcePost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocal(items: ResourcePost[]) {
  await mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await writeFile(INDEX_PATH, JSON.stringify(items, null, 2));
}

async function readBlob(): Promise<ResourcePost[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_INDEX });
    const file = blobs.find((item) => item.pathname === BLOB_INDEX);
    if (!file) return [];
    const res = await fetch(file.url, { cache: "no-store" });
    if (!res.ok) return [];
    const parsed = (await res.json()) as ResourcePost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeBlob(items: ResourcePost[]) {
  await put(BLOB_INDEX, JSON.stringify(items), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
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
  const items = useBlob() ? await readBlob() : await readLocal();
  const next = [item, ...items.filter((row) => row.id !== item.id)];
  if (useBlob()) await writeBlob(next);
  else await writeLocal(next);
  return item;
}

export async function removeResource(id: string) {
  const items = useBlob() ? await readBlob() : await readLocal();
  const target = items.find((item) => item.id === id);
  if (!target) return null;
  const next = items.filter((item) => item.id !== id);
  if (useBlob()) {
    await writeBlob(next);
    if (target.fileUrl.includes("blob.vercel-storage.com") || target.fileUrl.includes("vercel-storage.com")) {
      try {
        await del(target.fileUrl);
      } catch {
        // ignore missing blob
      }
    }
  } else {
    await writeLocal(next);
    if (target.fileUrl.startsWith("/uploads/")) {
      try {
        await unlink(path.join(process.cwd(), "public", target.fileUrl.replace(/^\//, "")));
      } catch {
        // ignore missing file
      }
    }
  }
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
