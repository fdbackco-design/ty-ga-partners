import { NEWS } from "@/lib/data";

export type TyLifePost = {
  id: string;
  title: string;
  image: string;
  href: string;
  external: boolean;
};

const SITE = "https://ty-life.co.kr";

function fallbackNews(): TyLifePost[] {
  return NEWS.map((item) => ({
    id: item.slug,
    title: item.title,
    image: item.image,
    href: `/news/${item.slug}`,
    external: false,
  }));
}

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function cleanTitle(raw: string) {
  let text = decode(raw)
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  while (/^(공지|MOU|소식|수상)\s+/.test(text)) {
    text = text.replace(/^(공지|MOU|소식|수상)\s+/, "").trim();
  }
  return text;
}

function parseChunk(html: string, posts: TyLifePost[], seen: Set<string>) {
  const re =
    /href="(\/news\/\?[^"]*idx=(\d+)[^"]*)"[\s\S]{0,1500}?(?:url\(&quot;(https:\/\/cdn\.imweb\.me\/thumbnail\/[^&]+)&quot;\)|src="(https:\/\/cdn\.imweb\.me\/thumbnail\/[^"]+)")[\s\S]{0,900}?<div class="title title-block">([\s\S]*?)<\/div>/g;

  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const id = match[2];
    if (seen.has(id)) continue;
    const title = cleanTitle(match[5] ?? "");
    const image = match[3] || match[4];
    if (!title || !image) continue;
    seen.add(id);
    posts.push({
      id,
      title,
      image,
      href: `${SITE}/news/?idx=${id}&bmode=view`,
      external: true,
    });
  }
}

export function parseTyLifeNews(html: string): TyLifePost[] {
  const seen = new Set<string>();
  const posts: TyLifePost[] = [];
  const newest = html.match(/id="newest_w202607105e49baa3ec16d"[\s\S]*?<!-- \/\/카드형/);
  const board = html.match(/id="post_card_b2026070745d1f23bf56e6"[\s\S]*?<div class="li_footer/);
  if (newest) parseChunk(newest[0], posts, seen);
  if (board) parseChunk(board[0], posts, seen);
  if (!posts.length) parseChunk(html, posts, seen);
  return posts;
}

export async function getTyLifeNews(limit?: number): Promise<TyLifePost[]> {
  try {
    const res = await fetch(`${SITE}/news`, {
      next: { revalidate: 1800 },
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return fallbackNews().slice(0, limit ?? undefined);
    const posts = parseTyLifeNews(await res.text());
    const list = posts.length ? posts : fallbackNews();
    return typeof limit === "number" ? list.slice(0, limit) : list;
  } catch {
    return fallbackNews().slice(0, limit ?? undefined);
  }
}
