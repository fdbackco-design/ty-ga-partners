import Link from "next/link";
import Reveal from "../Reveal";

function RefundIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.6 12a7.4 7.4 0 1 1 2.1 5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4.4 6.2v4.6h4.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Product() {
  return (
    <section id="Product" className="alc-section">
      <div className="alc-wrap">
        <Reveal>
          <header className="alc-head">
            <p className="alc-eyebrow">TY-GA파트너스 전용상품  |  ALL LIFE CARE</p>
            <h2 className="alc-title">올라이프케어</h2>
            <p className="alc-lead">월 3만원대로 준비하는 우리 가족의 건강·생활 통합 케어</p>
          </header>
        </Reveal>

        <Reveal delay={80}>
          <div className="alc-formula">
            <article className="alc-card alc-life">
              <div className="alc-life-head">
                <h3>라이프 서비스</h3>
                <p>TY LIFE 제공 서비스 · 택1</p>
              </div>
              <div className="alc-life-split">
                <figure className="alc-life-tile">
                  <img src="/images/life-service-cruise.png" alt="크루즈 여행을 즐기는 중년 부부" />
                  <figcaption>크루즈</figcaption>
                </figure>
                <figure className="alc-life-tile">
                  <img src="/images/life-service-funeral.jpg" alt="정장을 입은 장례 서비스" />
                  <figcaption>장례 서비스</figcaption>
                </figure>
              </div>
            </article>

            <span className="alc-plus" aria-hidden>
              +
            </span>

            <article className="alc-card alc-health">
              <h3>건강 케어</h3>
              <div className="alc-health-stack">
                <div className="alc-mini">
                  <div className="alc-mini-media">
                    <img src="/images/healthcare-mobile-report.png" alt="스마트폰으로 건강 리포트를 확인하는 모습" />
                  </div>
                  <div className="alc-mini-copy">
                    <h4>헬스케어 서비스</h4>
                    <p>모바일 기반 1:1 건강관리</p>
                    <span className="alc-tag">1:1 건강관리</span>
                  </div>
                </div>
                <div className="alc-mini">
                  <div className="alc-mini-media">
                    <img src="/images/cancer-risk-home-test.png" alt="전문 간호사가 자택에서 방문 채혈을 진행하는 모습" />
                  </div>
                  <div className="alc-mini-copy">
                    <h4>암 위험도 검사</h4>
                    <p>현재와 미래의 건강 위험 확인</p>
                    <div className="alc-tags">
                      <span className="alc-tag">유전자 분석</span>
                      <span className="alc-tag">종양표지자 검사</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <span className="alc-plus" aria-hidden>
              +
            </span>

            <article className="alc-card alc-goods">
              <h3>라이프 상품</h3>
              <div className="alc-goods-media">
                <img src="/images/life-products-appliances.png" alt="밝은 거실에 배치된 다양한 생활가전" />
              </div>
              <div className="alc-goods-copy">
                <p>건강과 일상을 위한 상품 선택</p>
                <span className="alc-choice">상품 택1</span>
              </div>
            </article>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="alc-refund">
            <div className="alc-refund-icon">
              <RefundIcon />
            </div>
            <div className="alc-refund-copy">
              <h3>
                라이프 서비스 미이용 시 <span>만기 100% 환급</span>
              </h3>
              <p>월 소액 납입한 금액은 만기에 전액 환급</p>
            </div>
            <strong className="alc-refund-pct">100%</strong>
          </div>
        </Reveal>

        <div className="alc-cta">
          <Link href="/resources" className="btn-apply h-12 px-8">
            자료보기
          </Link>
        </div>
        <p className="alc-notes">
          * 헬스케어 서비스는 TY LIFE와 업무 제휴한 전문 헬스케어 서비스 회사 GC케어가 위탁 운영합니다.
          <br />* 라이프 상품은 추후 일부 추가, 변동될 수 있습니다.
        </p>
      </div>
    </section>
  );
}
