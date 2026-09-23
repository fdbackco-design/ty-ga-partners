"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ApplyButton from "../ApplyButton";

type HeroSlide = {
  id: string;
  kind: "graphic" | "photo";
  image: string;
  focalX: string;
  focalY: string;
  fit?: "cover" | "contain";
  eyebrow: string;
  title: string[];
  desc?: string[];
  chips?: string[];
  cta: string;
  href: string;
};

const SLIDES: HeroSlide[] = [
  {
    id: "partners",
    kind: "graphic",
    image: "/images/hero.png",
    focalX: "64%",
    focalY: "50%",
    eyebrow: "TY - GA 공식인증센터",
    title: ["업계 최상위 리워드", "TY - GA 파트너스"],
    chips: ["하루 1시간", "언제 어디서든", "자격 시험 X"],
    cta: "파트너스 시작하기 →",
    href: "/#inputcontact",
  },
  {
    id: "life",
    kind: "photo",
    image: "/images/banner-2.jpg?v=2",
    focalX: "70%",
    focalY: "48%",
    eyebrow: "삶을 위한 모든 케어",
    title: ["태양라이프"],
    desc: ["평상시의 건강부터 특별한 순간까지.", "당신의 라이프스타일을 더욱 가치 있게 만듭니다."],
    cta: "파트너스 시작하기 →",
    href: "/#inputcontact",
  },
  {
    id: "alllife",
    kind: "photo",
    image: "/images/banner-3.jpg?v=2",
    focalX: "76%",
    focalY: "52%",
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
    kind: "photo",
    image: "/images/banner-4.jpg?v=2",
    focalX: "84%",
    focalY: "58%",
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
  const swipe = useRef({ active: false, x: 0, dx: 0 });

  const go = useCallback((next: number) => {
    setI((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(i + 1), 5500);
    return () => clearInterval(t);
  }, [i, paused, go]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("a, button")) return;
    swipe.current = { active: true, x: event.clientX, dx: 0 };
    setPaused(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!swipe.current.active) return;
    swipe.current.dx = event.clientX - swipe.current.x;
  };

  const endSwipe = () => {
    if (!swipe.current.active) return;
    const { dx } = swipe.current;
    swipe.current.active = false;
    setPaused(false);
    if (dx > 48) go(i - 1);
    else if (dx < -48) go(i + 1);
  };

  const slide = SLIDES[i];

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="메인 배너"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="hero-frame"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endSwipe}
        onPointerCancel={endSwipe}
      >
        <div className="hero-stage">
          {SLIDES.map((item, idx) => (
            <div
              key={item.id}
              className={`hero-slide ${item.kind === "graphic" ? "is-graphic" : "is-photo"} ${
                i === idx ? "is-on" : ""
              }`}
              aria-hidden={i !== idx}
            >
              <img
                className="hero-image"
                src={item.image}
                alt=""
                width={item.kind === "graphic" ? 1440 : 4320}
                height={item.kind === "graphic" ? 571 : 1600}
                decoding={idx === 1 ? "sync" : "async"}
                fetchPriority={idx === 1 ? "high" : "low"}
                draggable={false}
                style={
                  {
                    "--focus-x": item.focalX,
                    "--focus-y": item.focalY,
                    "--hero-fit": item.fit ?? "cover",
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </div>

        <div className="wrap hero-inner">
          <div key={slide.id} className="hero-copy max-w-[580px]">
            <p className="hero-eyebrow">{slide.eyebrow}</p>
            <h1>
              {slide.title.map((line, lineIdx) => (
                <span key={line}>
                  {lineIdx > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </h1>
            {slide.desc ? (
              <p className="hero-desc">
                {slide.desc.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            ) : null}
            {slide.chips ? (
              <div className="chips">
                {slide.chips.map((chip) => (
                  <span key={chip} className="chip">
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
            <ApplyButton className="hero-cta" href={slide.href} badge={false}>
              {slide.cta}
            </ApplyButton>
          </div>
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
