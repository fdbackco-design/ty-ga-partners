import Link from "next/link";
import Reveal from "@/components/Reveal";
import NewsCard from "@/components/NewsCard";
import { getTyLifeNews } from "@/lib/tyLifeNews";

export const revalidate = 1800;

export default async function NewsPage() {
  const posts = await getTyLifeNews();

  return (
    <main className="py-12 bg-[#f9f9f9] min-h-[70vh]">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / 파트너 소식
        </p>
        <h1 className="section-title mt-4">파트너 소식</h1>
        <div className="news-grid mt-10">
          {posts.map((item, i) => (
            <Reveal key={item.id} delay={i * 80}>
              <NewsCard item={item} />
            </Reveal>
          ))}
        </div>
        <div className="text-center mt-12">
          <a
            href="https://ty-life.co.kr/news"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center px-6 rounded-full border border-[#ddd] font-bold transition-transform duration-200 hover:-translate-y-0.5"
          >
            TY Life에서 더보기
          </a>
        </div>
      </div>
    </main>
  );
}
