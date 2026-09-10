"use client";

import { useState } from "react";
import { PRODUCTS } from "@/lib/data";
import Reveal from "../Reveal";

export default function Earnings() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="earnings" className="py-[200px] bg-white">
      <div className="wrap">
        <Reveal>
          <p className="section-label">예상 수익 계산</p>
          <h2 className="section-title mt-3">
            내 예상 수익은
            <br />
            얼마일까?
          </h2>
          <p className="mt-5 text-[18px] leading-8">
            매월 상조 납부비용을 통해
            <br />
            예상 수익을 확인해보세요!
          </p>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {PRODUCTS.map((p, idx) => (
            <Reveal key={p.name} delay={idx * 90}>
              <button
                type="button"
                className="card-shadow card-hover px-6 py-11 text-center w-full h-full"
                onClick={() => setOpen(idx)}
              >
                <img src={p.icon} alt="" className="w-[118px] h-[118px] object-contain mx-auto" />
                <p className="mt-7 text-[22px] font-extrabold leading-[1.65]">
                  월 상조비용 <span className="accent">{p.price}</span>
                  <br />
                  <span className="accent">{p.name}</span>
                  {"sub" in p && p.sub ? p.sub : null}
                </p>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {open !== null ? (
        <div className="modal" onClick={() => setOpen(null)}>
          <div
            className="relative bg-white rounded-[28px] w-full max-w-[490px] px-10 py-11 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-6 right-6 w-16 h-16 rounded-full bg-[#c9c9c9] text-white text-2xl"
              onClick={() => setOpen(null)}
              aria-label="닫기"
            >
              ✕
            </button>
            <p className="text-[30px] font-extrabold text-[var(--sub)]">내 예상 소득</p>
            <p className="mt-1 text-[46px] font-extrabold accent">{PRODUCTS[open].income}</p>
            <img src="/images/money-stack.png" alt="" className="mx-auto my-8 h-[220px] object-contain" />
            <p className="text-[40px] font-extrabold accent leading-tight">다구좌 시 최대 3배</p>
            <p className="mt-5 text-sm text-[var(--sub)]">*가입하는 상품에 따라 달라질 수 있습니다.</p>
            <a href="#inputcontact" className="btn-apply w-full mt-7" onClick={() => setOpen(null)}>
              예상 소득 신청하기
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}
