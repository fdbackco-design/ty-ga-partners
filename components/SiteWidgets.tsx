"use client";

import { usePathname } from "next/navigation";
import SideQuick from "@/components/SideQuick";
import FloatingCta from "@/components/FloatingCta";
import BackToTop from "@/components/BackToTop";
import { FOOTER_LEGAL } from "@/lib/data";

export default function SiteWidgets() {
  const pathname = usePathname();
  const hideExtras =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/resources" ||
    pathname.startsWith("/resources/") ||
    pathname === "/inquiries" ||
    pathname.startsWith("/inquiries/") ||
    pathname.startsWith("/partners") ||
    FOOTER_LEGAL.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <>
      {hideExtras ? null : <SideQuick />}
      {hideExtras ? null : <FloatingCta />}
      <BackToTop />
    </>
  );
}
