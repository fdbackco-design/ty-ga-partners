import type { ReactNode } from "react";
import Link from "next/link";
import ApplyFooterShift from "@/components/partners/ApplyFooterShift";

export default function PartnerApplyShell({
  step,
  of = 3,
  title,
  backHref,
  className,
  children,
}: {
  step: number;
  of?: number;
  title: string;
  backHref?: string;
  className?: string;
  children: ReactNode;
}) {
  const percent = Math.round((step / of) * 100);
  return (
    <main className={`partner-apply${className ? ` ${className}` : ""}`}>
      <ApplyFooterShift />
      <div className="partner-apply-col">
        <div className="partner-apply-head">
          {backHref ? (
            <Link href={backHref} className="partner-apply-back" aria-label="뒤로가기">
              ←
            </Link>
          ) : (
            <span className="partner-apply-back is-spacer" />
          )}
          <h1>{title}</h1>
          <span className="partner-apply-step">
            {step}/{of}
          </span>
        </div>
        <div className="partner-apply-progress" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
        </div>
        {children}
      </div>
    </main>
  );
}
