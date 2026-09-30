import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResourceContent from "@/components/ResourceContent";
import ResourceDeleteButton from "@/components/ResourceDeleteButton";
import { getResourceAccess as loadResourceAccess } from "@/lib/resourceAccess";
import {
  formatFileSize,
  isPlayableVideo,
  resourceFileSrc,
  resourceHasVideo,
  videoMimeType,
} from "@/lib/resources";
import { getResource as loadResource } from "@/lib/resourcesStore";

const getResource = cache(loadResource);
const getResourceAccess = cache(loadResourceAccess);

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const access = await getResourceAccess();
  if (!access.canView) return { title: "자료실" };
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
  const access = await getResourceAccess();
  if (!access.canView) {
    return (
      <main className="legal-page resource-article-page">
        <div className="wrap">
          <p className="resource-article-crumb">
            <Link href="/">홈</Link> / <Link href="/resources">자료실</Link>
          </p>
          <h1 className="resource-index-title">자료실</h1>
          <div className="resource-gate">
            <p>로그인 후 자료를 확인할 수 있습니다.</p>
            <Link href={`/login?next=/resources/${id}`} className="btn-apply">
              로그인
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const item = await getResource(id);
  if (!item) notFound();

  const files = item.files;
  const playable = access.canDownload
    ? files.filter((file) => isPlayableVideo(file.name) && file.url)
    : [];

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
                <span className="resource-article-cat">{item.category || "자료실"}</span>
                {resourceHasVideo(item) ? <span className="resource-video-badge">영상</span> : null}
              </div>
              <ResourceDeleteButton id={item.id} />
            </div>
            <h1 className="resource-article-title">{item.title}</h1>
            <p className="resource-article-date">
              <span>등록일</span>
              <time dateTime={item.createdAt}>{item.createdAt.slice(0, 10)}</time>
            </p>
          </header>

          {!access.canDownload ? (
            <div className="resource-issue-bar">
              <div className="resource-issue-bar-copy">
                <strong>자료 다운로드 안내</strong>
                <p>파일 다운로드는 사원 코드 발급 후 이용할 수 있습니다.</p>
              </div>
              <Link href="/partners/apply" className="resource-issue-bar-cta">
                사원코드 무료 발급 →
              </Link>
            </div>
          ) : null}

          <div className="resource-article-body">
            <ResourceContent content={item.content} />
            {playable.map((file) => {
              const src = resourceFileSrc(file.url);
              return (
                <div key={file.url} className="resource-video">
                  <video controls playsInline preload="metadata" aria-label={file.name}>
                    <source src={src} type={videoMimeType(file.name)} />
                    이 브라우저에서는 영상을 재생할 수 없습니다. 아래 버튼으로 내려받아 주세요.
                  </video>
                </div>
              );
            })}
          </div>

          {files.length ? (
            <div className="resource-article-files">
              {files.map((file) => {
                const src = access.canDownload && file.url ? resourceFileSrc(file.url) : "";
                const label = fileExtLabel(file.name);
                return (
                  <div key={`${file.name}-${file.size}`} className="resource-file-card">
                    <span className="resource-file-icon">
                      <FileTypeIcon />
                    </span>
                    <div className="resource-file-copy">
                      <strong>{file.name}</strong>
                      <span>
                        {label} / {formatFileSize(file.size)}
                      </span>
                    </div>
                    {src ? (
                      <a
                        className="resource-file-download"
                        href={src}
                        download={file.name}
                        aria-label={`${file.name} 내려받기 (${formatFileSize(file.size)})`}
                      >
                        <DownloadIcon />
                        다운로드
                      </a>
                    ) : (
                      <span className="resource-file-locked">다운로드 불가</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </article>
      </div>
    </main>
  );
}
