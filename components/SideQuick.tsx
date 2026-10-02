import Link from "next/link";
import { COMPANY } from "@/lib/data";

export default function SideQuick() {
  return (
    <aside className="side-quick" aria-label="바로가기">
      <Link href="/consult" className="side-quick-consult">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.4 21 3 12.6 3 3c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
            fill="currentColor"
          />
        </svg>
        <span className="mt-1 leading-tight">
          상담신청
          <br />
          <em className="not-italic font-medium text-[11px]">Click!</em>
        </span>
      </Link>
      <a
        href={COMPANY.blog}
        target="_blank"
        rel="noreferrer"
        className="bg-white text-[#555] border-t border-[#eee]"
      >
        <span className="w-9 h-6 rounded bg-[#03c75a] text-white text-[11px] font-extrabold leading-6">
          blog
        </span>
        <span className="mt-1">네이버 블로그</span>
      </a>
      <a
        href={COMPANY.instagram}
        target="_blank"
        rel="noreferrer"
        className="bg-white text-[#555] border-t border-[#eee]"
      >
        <span className="w-7 h-7 rounded-[8px] bg-[linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7)]" />
        <span className="mt-1">인스타그램</span>
      </a>
      <a href={COMPANY.site} target="_blank" rel="noreferrer" className="bg-[#c4a15a] text-white">
        <span className="font-serif text-[22px] leading-none">TY</span>
        <span className="text-[11px] font-serif">TY Life</span>
      </a>
      {/* DB구매문의 — 잠시 비표시
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSeCveLz994GyUkE-jKLnCGqt605t5cf-LCgsApbqRzkqw22TA/viewform"
        target="_blank"
        rel="noreferrer"
        className="bg-white text-[#555] border-t border-[#eee]"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
          <ellipse cx="10" cy="5" rx="5.5" ry="2.5" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M4.5 5v8c0 1.4 2.5 2.5 5.5 2.5.7 0 1.4-.1 2-.2M15.5 5v5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M4.5 9c0 1.4 2.5 2.5 5.5 2.5 2 0 3.8-.5 4.7-1.2M15 15.5h5.5M17.8 12.8v5.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <span className="mt-1">DB구매문의</span>
      </a>
      */}
    </aside>
  );
}
