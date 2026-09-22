import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { get, put } from "@vercel/blob";

const ROOT = path.join(process.cwd(), "data", "contracts");

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function contractObjectPath(applicationId: string, name: "signature.png" | "signed.pdf") {
  return `contracts/${applicationId}/${name}`;
}

export async function saveContractFile(applicationId: string, name: "signature.png" | "signed.pdf", bytes: Buffer) {
  const objectPath = contractObjectPath(applicationId, name);
  if (blobEnabled()) {
    await put(objectPath, bytes, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: name.endsWith(".pdf") ? "application/pdf" : "image/png",
    });
    return objectPath;
  }
  const full = path.join(ROOT, applicationId, name);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes);
  return objectPath;
}

export async function readContractFile(objectPath: string) {
  if (blobEnabled()) {
    const result = await get(objectPath, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  }
  try {
    return await readFile(path.join(process.cwd(), "data", objectPath));
  } catch {
    return null;
  }
}
