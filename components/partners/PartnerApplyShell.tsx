import type { ReactNode } from "react";
import Link from "next/link";

export default function PartnerApplyShell({
  step,
  title,
  backHref,
  children,
}: {
  step: 1 | 2 | 3;
  title: string;
  backHref?: string;
  children: ReactNode;
}) {
  const percent = Math.round((step / 3) * 100);
  return (
    <main className="partner-apply">
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
            {step}/3
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
