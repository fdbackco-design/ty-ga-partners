import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { list, put } from "@vercel/blob";
import { type Inquiry } from "@/lib/inquiries";

const INDEX_PATH = path.join(process.cwd(), "data", "inquiries.json");
const BLOB_INDEX = "inquiries/index.json";

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readLocal(): Promise<Inquiry[]> {
  try {
    const raw = await readFile(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw) as Inquiry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocal(items: Inquiry[]) {
  await mkdir(path.dirname(INDEX_PATH), { recursive: true });
  await writeFile(INDEX_PATH, JSON.stringify(items, null, 2));
}

async function readBlob(): Promise<Inquiry[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_INDEX });
    const file = blobs.find((item) => item.pathname === BLOB_INDEX);
    if (!file) return [];
    const res = await fetch(file.url, { cache: "no-store" });
    if (!res.ok) return [];
    const parsed = (await res.json()) as Inquiry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeBlob(items: Inquiry[]) {
  await put(BLOB_INDEX, JSON.stringify(items), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getInquiries() {
  const items = useBlob() ? await readBlob() : await readLocal();
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getInquiry(id: string) {
  return (await getInquiries()).find((item) => item.id === id) ?? null;
}

export async function saveInquiry(item: Inquiry) {
  const items = useBlob() ? await readBlob() : await readLocal();
  const next = [item, ...items.filter((row) => row.id !== item.id)];
  if (useBlob()) await writeBlob(next);
  else await writeLocal(next);
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
