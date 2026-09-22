import { readdir, readFile, stat } from "fs/promises";
import path from "path";

const ROOT = path.join(process.cwd(), ".next/static");
const FORBIDDEN = ["ludus-server", "api/employee"];

async function walk(dir, files = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    console.error(".next/static 이 없습니다. 먼저 npm run build 를 실행하세요.");
    process.exit(1);
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
      continue;
    }
    if (entry.name.endsWith(".js")) files.push(full);
  }
  return files;
}

const files = await walk(ROOT);
const hits = [];
for (const file of files) {
  const info = await stat(file);
  if (info.size > 8_000_000) continue;
  const text = await readFile(file, "utf8");
  for (const needle of FORBIDDEN) {
    if (text.includes(needle)) hits.push(`${path.relative(process.cwd(), file)} ← ${needle}`);
  }
}

if (hits.length) {
  console.error("클라이언트 번들에 TY 사원등록 호출 문자열이 포함되어 있습니다.");
  for (const hit of hits) console.error(hit);
  process.exit(1);
}

console.log(`ok: ${files.length}개 JS에서 ludus-server / api/employee 없음`);
