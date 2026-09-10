"use client";

import { useCallback, useEffect, useState } from "react";
import ApplyButton from "../ApplyButton";

const SLIDES = [
  {
    id: "partners",
    kind: "graphic" as const,
    eyebrow: "TA - GA 공식인증센터",
    title: ["업계 최상위 리워드", "TA - GA 파트너스"],
    chips: ["하루 1시간", "언제 어디서든", "자격 시험 X"],
    cta: "파트너스 시작하기 →",
    href: "/#inputcontact",
  },
  {
    id: "life",
    kind: "photo" as const,
    image: "/images/banner-2.jpg?v=2",
    eyebrow: "삶을 위한 모든 케어",
    title: ["태양라이프"],
    desc: ["평상시의 건강부터 특별한 순간까지.", "당신의 라이프스타일을 더욱 가치 있게 만듭니다."],
    cta: "파트너스 시작하기 →",
    href: "/#inputcontact",
  },
  {
    id: "alllife",
    kind: "photo" as const,
    image: "/images/banner-3.jpg?v=2",
    eyebrow: "건강을 미리 준비하는 방법",
    title: ["TY올라이프케어"],
    desc: [
      "헬스케어 서비스부터 암 위험도 검사까지",
      "건강한 오늘과 든든한 내일을 TY올라이프케어가 함께합니다.",
    ],
    cta: "상품 자세히보기 →",
    href: "/#Product",
  },
  {
    id: "cruise",
    kind: "photo" as const,
    image: "/images/banner-4.jpg?v=2",
    eyebrow: "일상에 쉼을 더하는 특별한 여행",
    title: ["TY썬크루즈"],
    desc: [
      "단 12회 선납으로 떠나는 프리미엄 크루즈.",
      "준비부터 여행의 모든 순간까지 TY LIFE가 함께합니다.",
    ],
    cta: "파트너스 시작하기 →",
    href: "/#inputcontact",
  },
];

export default function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setI((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(i + 1), 5500);
    return () => clearInterval(t);
  }, [i, paused, go]);

  const slide = SLIDES[i];

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="메인 배너"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((item, idx) => (
        <div
          key={item.id}
          className={`hero-slide ${item.kind === "graphic" ? "is-graphic" : "is-photo"} ${
            i === idx ? "is-on" : ""
          }`}
          aria-hidden={i !== idx}
        >
          {item.kind === "photo" ? (
            <img
              src={item.image}
              alt=""
              width={4320}
              height={1600}
              decoding={idx === 1 ? "sync" : "async"}
              fetchPriority={idx === 1 ? "high" : "low"}
              draggable={false}
            />
          ) : null}
        </div>
      ))}

      <div className="wrap hero-inner">
        <div key={slide.id} className="hero-copy max-w-[580px]">
          <p className="text-[22px] md:text-[24px] font-extrabold tracking-[-0.04em] text-[var(--ink)]">
            {slide.eyebrow}
          </p>
          <h1 className="mt-4">
            {slide.title.map((line, lineIdx) => (
              <span key={line}>
                {lineIdx > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </h1>
          {"desc" in slide && slide.desc ? (
            <p className="hero-desc">
              {slide.desc.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          ) : null}
          {"chips" in slide && slide.chips ? (
            <div className="chips">
              {slide.chips.map((chip) => (
                <span key={chip} className="chip">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
          <ApplyButton className="mt-8" href={slide.href} badge={false}>
            {slide.cta}
          </ApplyButton>
        </div>
      </div>

      <div className="hero-controls">
        <button type="button" className="hero-arrow" aria-label="이전 배너" onClick={() => go(i - 1)}>
          ‹
        </button>
        <div className="hero-dots">
          {SLIDES.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${idx + 1}번째 배너`}
              aria-current={i === idx ? true : undefined}
              className={i === idx ? "is-on" : ""}
              onClick={() => go(idx)}
            />
          ))}
        </div>
        <button type="button" className="hero-arrow" aria-label="다음 배너" onClick={() => go(i + 1)}>
          ›
        </button>
      </div>
    </section>
  );
}
