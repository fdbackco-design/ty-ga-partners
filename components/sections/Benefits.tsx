import Reveal from "../Reveal";

export default function Benefits() {
  const cards = [
    {
      icon: "/images/benefit-1.png",
      lines: ["TY상품을 마케팅하면", "보험 계약 체결이", "쉬워집니다"],
      strong: "보험 계약 체결이",
    },
    {
      icon: "/images/benefit-2.png",
      lines: [
        "보험 방문 보장분석DB가",
        "필요할 때는 요청 하세요!",
        "오프라인 현장 서명 DB를",
        "구매할 수 있어요!",
      ],
      strong: "보장분석DB가",
    },
    {
      icon: "/images/benefit-3.png",
      lines: ["TY 1인 GA파트너스", "누구나 쉽게 활동 할 수 있어요", "간편한 시스템 제공"],
      strong: "간편한 시스템 제공",
    },
  ];

  return (
    <section className="pb-[144px] md:pb-[180px] bg-white">
      <div className="wrap">
        <Reveal>
          <p className="section-label">보험 수익이 불안해요</p>
          <h2 className="section-title xl mt-2">걱정하지 마세요</h2>
          <p className="mt-4 text-[18px] text-[var(--sub)]">
            TY-1인 GA파트너스를 활용하면 수익이 증가해요!
          </p>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <Reveal key={card.icon} delay={i * 90}>
              <article className="card-shadow card-hover px-7 py-11 text-center h-full">
                <img src={card.icon} alt="" className="w-[118px] h-[118px] object-contain mx-auto" />
                <div className="mt-7 text-[22px] font-extrabold leading-[1.65] tracking-[-0.03em]">
                  {card.lines.map((line) => (
                    <p key={line} className={line.includes(card.strong) ? "accent" : ""}>
                      {line}
                    </p>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
