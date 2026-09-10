"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { NAV } from "@/lib/data";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, ready, isAdmin, logout } = useAuth();

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
              className={
                item.href.startsWith("/") && !item.href.startsWith("/#") && pathname.startsWith(item.href)
                  ? "is-on"
                  : ""
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <div className={`header-auth ${ready ? "is-ready" : ""}`}>
            {user ? (
              <>
                <span className="header-user">{isAdmin ? "관리자" : `${user.name}님`}</span>
                <button type="button" className="header-text-btn" onClick={logout}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`header-text-btn ${pathname === "/login" ? "is-on" : ""}`}>
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className={`header-text-btn header-text-btn-accent ${pathname === "/signup" ? "is-on" : ""}`}
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
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
            {user ? (
              <button
                type="button"
                className="py-3 font-semibold text-left"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                로그아웃
              </button>
            ) : (
              <>
                <Link href="/login" className="py-3 font-semibold" onClick={() => setOpen(false)}>
                  로그인
                </Link>
                <Link href="/signup" className="py-3 font-semibold" onClick={() => setOpen(false)}>
                  회원가입
                </Link>
              </>
            )}
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
