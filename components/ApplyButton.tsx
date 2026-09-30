"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function ApplyButton({
  href = "/#inputcontact",
  children = "파트너스 신청하기",
  badge = true,
  className = "",
}: {
  href?: string;
  children?: React.ReactNode;
  badge?: boolean;
  className?: string;
}) {
  const { partner, ready } = useAuth();
  const issued = Boolean(ready && partner?.issued);
  return (
    <Link href={href} className={`btn-apply ${className}`}>
      {issued ? "발급 완료" : children}
      {badge && !issued ? <span className="badge">마감 임박!</span> : null}
    </Link>
  );
}
