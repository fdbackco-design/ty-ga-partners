import ApplyButton from "../ApplyButton";
import Reveal from "../Reveal";

export default function Intro() {
  return (
    <section id="GA" className="py-[180px] md:py-[220px] bg-white">
      <div className="wrap grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <p className="text-[24px] font-extrabold tracking-[-0.04em]">보험 계약으로 연결하는</p>
          <h2 className="section-title xl mt-3">
            날 위한 N잡
            <br />
            <span className="accent">TY-1인 GA파트너스</span>
          </h2>
          <p className="mt-6 text-[20px] leading-8 font-medium">
            하루 1시간,언제 어디서든
            <br />
            쉽고 편하게 시작해 보세요!
          </p>
          <p className="mt-3 text-sm text-[var(--sub)]">*개인마다 소요시간은 다를 수 있습니다.</p>
          <ApplyButton className="mt-8">파트너스 신청하기</ApplyButton>
        </Reveal>
        <Reveal delay={120} className="intro-tablet">
          <img src="/images/intro-tablet.png" alt="TY-GA파트너스 상품으로 보험계약 연결까지 가능!" className="mx-auto" />
        </Reveal>
      </div>
    </section>
  );
}
