import ApplyButton from "../ApplyButton";
import Reveal from "../Reveal";

export default function CtaBanner() {
  return (
    <section className="relative py-[200px] text-white text-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url(/images/cta-bg.png)" }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="wrap relative">
        <Reveal>
          <h2 className="text-[36px] md:text-[48px] font-extrabold tracking-[-0.04em]">
            티와이 파트너스
            <br />
            이제 여러분의 차례입니다
          </h2>
          <ApplyButton className="mt-10">지금 시작하기</ApplyButton>
        </Reveal>
      </div>
    </section>
  );
}
