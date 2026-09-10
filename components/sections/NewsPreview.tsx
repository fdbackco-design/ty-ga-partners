import Link from "next/link";
import Reveal from "../Reveal";
import NewsCard from "../NewsCard";
import { getTyLifeNews } from "@/lib/tyLifeNews";

export default async function NewsPreview() {
  const posts = await getTyLifeNews(3);

  return (
    <section className="py-[160px] bg-[#f9f9f9]">
      <div className="wrap">
        <Reveal>
          <h2 className="section-title text-center">파트너 소식</h2>
        </Reveal>
        <div className="news-grid mt-12">
          {posts.map((item, i) => (
            <Reveal key={item.id} delay={i * 80}>
              <NewsCard item={item} />
            </Reveal>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/news"
            className="inline-flex h-11 items-center px-6 rounded-full border border-[#ddd] font-bold transition-transform duration-200 hover:-translate-y-0.5"
          >
            소식 더보기
          </Link>
        </div>
      </div>
    </section>
  );
}
