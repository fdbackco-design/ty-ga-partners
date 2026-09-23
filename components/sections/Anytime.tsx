import Reveal from "../Reveal";

export default function Anytime() {
  const cards = [
    {
      img: "/images/photo-3.png",
      lines: ["출퇴근 없이 언제 어디서나", "내가 원하는 시간에"],
      mobileLines: ["출퇴근 없이", "원하는 시간에"],
    },
    {
      img: "/images/photo-2.png",
      lines: ["학습부터 고객등록까지", "핸드폰 하나로"],
      mobileLines: ["학습·고객등록", "핸드폰 하나로"],
    },
    {
      img: "/images/photo-1.png",
      lines: ["영업압박 ZERO", "겸업도 부담없이"],
      mobileLines: ["영업압박 ZERO", "겸업도 부담없이"],
    },
  ];

  return (
    <section className="anytime py-[160px] bg-white">
      <div className="wrap">
        <Reveal>
          <p className="section-label">언제 • 어디서든</p>
          <h2 className="section-title mt-3">
            N잡 고민?
            <br />
            파트너스로 해결
          </h2>
        </Reveal>
        <div className="anytime-grid mt-12 grid grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <Reveal key={card.lines[0]} className="h-full min-w-0" delay={i * 90}>
              <article className="anytime-card card-shadow card-hover overflow-hidden h-full">
                <div className="img-zoom">
                  <img src={card.img} alt="" className="anytime-photo w-full h-[220px] object-cover" />
                </div>
                <div className="anytime-copy anytime-copy-desktop px-6 py-6 text-center text-[16px] font-extrabold leading-7">
                  {card.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="anytime-copy anytime-copy-mobile">
                  {card.mobileLines.map((line) => (
                    <p key={line}>{line}</p>
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
