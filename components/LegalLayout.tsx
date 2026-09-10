import type { ReactNode } from "react";
import Link from "next/link";

export default function LegalLayout({
  title,
  wide,
  children,
}: {
  title: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / {title}
        </p>
        <h1 className="legal-title">{title}</h1>
        <div className={`legal-body${wide ? " is-wide" : ""}`}>{children}</div>
      </div>
    </main>
  );
}
