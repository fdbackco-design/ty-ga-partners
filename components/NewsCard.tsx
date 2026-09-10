import Link from "next/link";
import type { TyLifePost } from "@/lib/tyLifeNews";

export default function NewsCard({ item }: { item: TyLifePost }) {
  const extra = item.external ? { target: "_blank", rel: "noreferrer" } : {};

  return (
    <Link href={item.href} className="news-card card-shadow card-hover overflow-hidden bg-white block" {...extra}>
      <div className="news-card-thumb img-zoom">
        <img src={item.image} alt="" />
      </div>
      <div className="news-card-body">
        <h3>{item.title}</h3>
      </div>
    </Link>
  );
}
