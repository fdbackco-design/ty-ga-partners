"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV } from "@/lib/data";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="wrap header-inner">
        <Link href="/" className="flex items-center shrink-0 h-full">
          <img
            src="/images/logo-header.png"
            alt="TY 1인 GA 파트너스"
            className="header-logo mix-blend-multiply"
          />
        </Link>

        <nav className="nav">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "is-on" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/#inputcontact" className="btn-ghost">
            신청하기 →
          </Link>
          <button
            type="button"
            className="mobile-menu items-center justify-center w-11 h-11"
            aria-label="메뉴"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`burger ${open ? "is-open" : ""}`} aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[#f2f2f2] bg-white/96 backdrop-blur-md shadow-[0_16px_32px_rgba(20,20,30,0.08)]">
          <div className="wrap py-4 flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-3 font-semibold"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#inputcontact"
              className="btn-apply mt-3 h-12"
              onClick={() => setOpen(false)}
            >
              파트너스 신청하기
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
