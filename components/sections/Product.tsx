import Reveal from "../Reveal";

export default function Product() {
  return (
    <section id="Product" className="py-[200px] bg-white">
      <div className="wrap text-center">
        <Reveal>
          <p className="section-label">TY-GA파트너스 전용상품 ｜ ALL LIFE CARE</p>
          <h2 className="section-title xl mt-4">올라이프케어</h2>
          <p className="mt-6 inline-block rounded-full bg-[#fff1ee] px-6 py-3 text-[17px] font-bold">
            우리가족 건강관리를 월 3만원대 스마트 헬스케어+암 검사 상품으로 준비하세요!
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="p4-row mt-12 text-left">
            <div className="p4-col fill">
              <div className="p4-block">
                <strong className="text-[20px]">라이프 서비스</strong>
                <p className="mt-3 leading-7">
                  TY LIFE에서 제공하는
                  <br />
                  라이프 서비스 (택1)
                </p>
              </div>
            </div>
            <span className="p4-plus">＋</span>
            <div className="p4-col">
              <div className="p4-block">
                <strong className="text-[20px]">헬스케어 서비스</strong>
                <p className="mt-3">1:1 건강관리 시스템</p>
              </div>
              <div className="p4-block">
                <strong className="text-[20px]">암 검사</strong>
                <p className="mt-3">암 발생 가능성 예측 및 대비</p>
              </div>
            </div>
            <span className="p4-plus">＋</span>
            <div className="p4-col">
              <div className="p4-block">
                <strong className="text-[20px]">
                  생활에 필요한
                  <br />
                  라이프 상품
                </strong>
                <p className="mt-3 leading-7">
                  테라웨이브 수딩 앰플
                  <br />
                  테라웨이브 G
                  <br />
                  에코백스 로봇청소기
                </p>
              </div>
            </div>
            <span className="p4-plus">＋</span>
            <div className="p4-col">
              <div className="p4-block">
                <strong className="text-[20px]">만기 100% 환급</strong>
                <p className="mt-3 leading-7">
                  월 소액 납입한 금액은
                  <br />
                  만기에 전액 환급
                </p>
                <p className="mt-3 text-xs text-[var(--sub)]">*라이프서비스 미사용시</p>
              </div>
            </div>
          </div>
        </Reveal>
        <p className="mt-6 text-left text-[13px] leading-6 text-[var(--sub)]">
          * 헬스케어 서비스는 TY LIFE와 업무 제휴한 전문 헬스케어 서비스 회사 GC케어가 위탁 운영합니다.
          <br />* 라이프 상품은 추후 일부 추가, 변동될 수 있습니다.
        </p>
      </div>
    </section>
  );
}
