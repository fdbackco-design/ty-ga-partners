import Link from "next/link";
import { notFound } from "next/navigation";
import { NEWS } from "@/lib/data";

export function generateStaticParams() {
  return NEWS.map((item) => ({ slug: item.slug }));
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = NEWS.find((n) => n.slug === slug);
  if (!item) notFound();

  return (
    <main className="py-12 bg-white min-h-[70vh]">
      <article className="wrap max-w-3xl">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / <Link href="/news">파트너 소식</Link>
        </p>
        <p className="mt-6 text-sm text-[var(--sub)]">{item.date}</p>
        <h1 className="mt-2 text-[32px] font-extrabold tracking-[-0.04em] leading-snug">{item.title}</h1>
        <img src={item.image} alt="" className="w-full rounded-2xl mt-8" />
        <p className="mt-8 leading-8 text-[17px]">{item.body}</p>
        <Link href="/news" className="inline-flex mt-10 h-11 items-center px-6 rounded-full border border-[#ddd] font-bold">
          목록으로
        </Link>
      </article>
    </main>
  );
}
