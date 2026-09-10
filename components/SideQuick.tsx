import { COMPANY } from "@/lib/data";

export default function SideQuick() {
  return (
    <aside className="side-quick" aria-label="바로가기">
      <a href="#inputcontact" className="side-quick-consult">
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
      </a>
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
    </aside>
  );
}
