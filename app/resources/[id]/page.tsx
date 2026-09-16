import Link from "next/link";
import { notFound } from "next/navigation";
import ResourceContent from "@/components/ResourceContent";
import ResourceDeleteButton from "@/components/ResourceDeleteButton";
import { formatFileSize, isPlayableVideo, videoMimeType } from "@/lib/resources";
import { getResource } from "@/lib/resourcesStore";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getResource(id);
  return {
    title: item ? `${item.title} | 자료실` : "자료실",
  };
}

function fileExtLabel(fileName: string) {
  const ext = fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return ext || "FILE";
}

function FileTypeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8.5 13h7M8.5 16.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4v11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 12.5 12 16.5 16 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getResource(id);
  if (!item) notFound();

  const fileLabel = fileExtLabel(item.fileName);

  return (
    <main className="legal-page resource-article-page">
      <div className="wrap">
        <p className="resource-article-crumb">
          <Link href="/">홈</Link> / <Link href="/resources">자료실</Link> / {item.title}
        </p>
        <article className="resource-article">
          <header className="resource-article-head">
            <div className="resource-article-top">
              <div className="resource-article-tags">
                <span className="resource-article-cat">자료실</span>
                {isPlayableVideo(item.fileName) ? <span className="resource-video-badge">영상</span> : null}
              </div>
              <ResourceDeleteButton id={item.id} />
            </div>
            <h1 className="resource-article-title">{item.title}</h1>
            <p className="resource-article-date">
              <span>등록일</span>
              <time dateTime={item.createdAt}>{item.createdAt.slice(0, 10)}</time>
            </p>
          </header>

          <div className="resource-article-body">
            <ResourceContent content={item.content} />
            {item.fileUrl && isPlayableVideo(item.fileName) ? (
              <div className="resource-video">
                <video controls playsInline preload="metadata" aria-label={item.title}>
                  <source src={item.fileUrl} type={videoMimeType(item.fileName)} />
                  이 브라우저에서는 영상을 재생할 수 없습니다. 아래 버튼으로 내려받아 주세요.
                </video>
              </div>
            ) : null}
          </div>

          {item.fileUrl ? (
            <div className="resource-article-files">
              <div className="resource-file-card">
                <span className="resource-file-icon">
                  <FileTypeIcon />
                </span>
                <div className="resource-file-copy">
                  <strong>{item.fileName}</strong>
                  <span>
                    {fileLabel} / {formatFileSize(item.fileSize)}
                  </span>
                </div>
                <a
                  className="resource-file-download"
                  href={item.fileUrl}
                  download={item.fileName}
                  aria-label={`${item.fileName} 내려받기 (${formatFileSize(item.fileSize)})`}
                >
                  <DownloadIcon />
                  다운로드
                </a>
              </div>
            </div>
          ) : null}
        </article>
      </div>
    </main>
  );
}
