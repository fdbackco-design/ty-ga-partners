"use client";

import { useState } from "react";
import { COMPANY } from "@/lib/data";

export default function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <footer className="bg-[#111] text-[#cfcfcf] py-14">
      <div className="wrap text-[13px] leading-7">
        <button type="button" className="text-left" onClick={() => setOpen(true)}>
          <p>
            상호 : {COMPANY.name} l 대표이사 : {COMPANY.ceo}
          </p>
          <p>진주 본사 : {COMPANY.jinju}</p>
          <p>서울 지사 : {COMPANY.seoul}</p>
          <p>
            대표번호 : {COMPANY.phone} l 이메일 : {COMPANY.email}
          </p>
        </button>
      </div>

      {open ? (
        <div className="modal" onClick={() => setOpen(false)}>
          <div
            className="bg-white text-[var(--ink)] rounded-2xl p-8 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-extrabold mb-4">사업자 정보</h3>
            <p className="leading-7 text-sm">
              상호 : {COMPANY.name}
              <br />
              대표이사 : {COMPANY.ceo}
              <br />
              진주 본사 : {COMPANY.jinju}
              <br />
              서울 지사 : {COMPANY.seoul}
              <br />
              대표번호 : {COMPANY.phone}
              <br />
              이메일 : {COMPANY.email}
            </p>
            <button
              type="button"
              className="btn-apply mt-6 w-full"
              onClick={() => setOpen(false)}
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}
    </footer>
  );
}
