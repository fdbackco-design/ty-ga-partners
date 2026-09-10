"use client";

import { useEffect, useState } from "react";
import ApplyButton from "../ApplyButton";
import Reveal from "../Reveal";

const SLIDES = [
  "/images/carousel-1.png",
  "/images/carousel-2.png",
  "/images/carousel-3.png",
  "/images/carousel-4.png",
];

export default function Open() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="py-[200px] bg-[#f6f6f6]">
      <div className="wrap grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <p className="section-label">TY- 1인 GA파트너스</p>
          <h2 className="section-title mt-3">
            이제는
            <br />
            TY – 1인 GA파트너스를
            <br />
            오픈합니다!
          </h2>
          <p className="mt-5 text-[24px] font-bold tracking-[-0.03em]">
            상조업계 빠른 성장을 성공한 TY Life!
          </p>
          <p className="mt-6 text-[18px] leading-8">
            독보적인 헬스케어 결합상품을 주상품으로
            <br />
            상조 고객을 대상으로 보험사에서 운영중인
            <br />
            헬스케어 서비스를 제공했습니다!
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_16px_40px_rgba(20,20,30,0.08)]">
            <img
              key={SLIDES[i]}
              src={SLIDES[i]}
              alt="TY Life 소개"
              className="slide-fade w-full h-[360px] object-cover"
            />
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {SLIDES.map((src, idx) => (
              <button
                key={src}
                type="button"
                aria-label={`${idx + 1}번째 슬라이드`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === idx ? "w-7 bg-[var(--accent)]" : "w-2.5 bg-[#ccc]"
                }`}
                onClick={() => setI(idx)}
              />
            ))}
          </div>
        </Reveal>
      </div>
      <div className="text-center mt-12">
        <ApplyButton>파트너스 신청하기</ApplyButton>
      </div>
    </section>
  );
}
