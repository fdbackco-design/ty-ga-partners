import Link from "next/link";

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
  return (
    <Link href={href} className={`btn-apply ${className}`}>
      {children}
      {badge ? <span className="badge">마감 임박!</span> : null}
    </Link>
  );
}
