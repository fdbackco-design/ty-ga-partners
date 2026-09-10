import Link from "next/link";
import { notFound } from "next/navigation";
import { formatFileSize } from "@/lib/resources";
import { getResource } from "@/lib/resourcesStore";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getResource(id);
  return {
    title: item ? `${item.title} | 자료실` : "자료실",
  };
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getResource(id);
  if (!item) notFound();

  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / <Link href="/resources">자료실</Link> / {item.title}
        </p>
        <h1 className="legal-title">{item.title}</h1>
        <p className="mt-3 text-sm text-[var(--sub)]">{item.createdAt.slice(0, 10)}</p>
        <div className="legal-body">
          <p className="resource-content">{item.content}</p>
          <a className="btn-apply inline-flex mt-8 h-12 px-6" href={item.fileUrl} download={item.fileName}>
            {item.fileName} 내려받기 ({formatFileSize(item.fileSize)})
          </a>
        </div>
      </div>
    </main>
  );
}
