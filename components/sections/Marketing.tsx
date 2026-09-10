import { GALLERY } from "@/lib/data";
import Reveal from "../Reveal";

export default function Marketing() {
  return (
    <section className="marketing">
      <div className="wrap text-center">
        <Reveal>
          <h2 className="section-title mt-2">
            TY 파트너스
            <br />
            쉽고 빠르게 시작하세요
          </h2>
          <p className="mt-4 text-[22px] text-[#777]">마케팅이 어려울까 걱정하지 않으셔도 됩니다</p>
        </Reveal>
      </div>

      <div className="marketing-hero">
        <div className="marketing-staff-wrap">
          <img className="marketing-staff" src="/images/staff-board.png?v=3" alt="" width={1000} height={750} />
        </div>
        <div className="gallery-viewport">
          <div className="gallery-track">
            {[0, 1, 2].map((copy) => (
              <div className="gallery-set" key={copy} aria-hidden={copy > 0}>
                {GALLERY.map((item) => (
                  <figure key={`${copy}-${item.title}`}>
                    <img src={item.src} alt="" width={800} height={450} />
                    <figcaption>{item.title}</figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Reveal className="mt-24">
        <p className="wrap text-center text-[28px] md:text-[36px] font-extrabold tracking-[-0.04em]">
          <span className="inline-block rounded-[10px] bg-[var(--accent)] text-white px-3 py-1">필요한 자료</span>
          <span> 를 모두 제작해드립니다</span>
        </p>
        <p className="mt-3 text-center text-[22px] text-[#777]">
          파트너 전용 랜딩페이지부터 상세페이지까지 원스톱으로
        </p>
      </Reveal>
    </section>
  );
}
