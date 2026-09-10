import Reveal from "../Reveal";

export default function WinWin() {
  return (
    <section className="winwin">
      <div className="wrap text-center">
        <Reveal>
          <p className="section-title">TY-GA파트너스</p>
          <p className="section-title accent mt-1">양방향 혜택 구조</p>
        </Reveal>

        <Reveal delay={80}>
          <div className="winwin-stage">
            <div className="winwin-side">
              <img src="/images/win-partner.png" alt="" width={82} height={82} />
              <p className="winwin-en">PARTNER</p>
              <p className="winwin-ko">파트너</p>
              <p className="winwin-sub">추천인</p>
            </div>
            <img
              className="winwin-hero"
              src="/images/win-center.png"
              alt=""
              width={400}
              height={400}
            />
            <div className="winwin-side">
              <img src="/images/win-customer.png" alt="" width={82} height={82} />
              <p className="winwin-en">CUSTOMER</p>
              <p className="winwin-ko">고객</p>
              <p className="winwin-sub">구매자</p>
            </div>
          </div>
        </Reveal>

        <p className="winwin-badge">WIN-WIN</p>
        <p className="winwin-copy">높은 수익 + 신뢰할 수 있는 브랜드 + 양방향 혜택</p>
        <p className="winwin-cta">지금 TY 파트너스로 시작하세요!</p>
      </div>
    </section>
  );
}
