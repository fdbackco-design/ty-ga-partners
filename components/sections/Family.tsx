import Reveal from "../Reveal";

export default function Family() {
  return (
    <section className="py-[200px] bg-[var(--accent)] text-white">
      <div className="wrap grid lg:grid-cols-[5fr_7fr] gap-10 items-center">
        <Reveal>
          <h2 className="text-[40px] md:text-[48px] font-extrabold tracking-[-0.04em] leading-[1.25]">
            내 상조부터,
            <br />
            가족 상조까지
            <br />
            스스로
          </h2>
          <p className="mt-8 text-[18px] leading-8 text-[#ffe4da]">
            파트너스가 되어 스스로
            <br />
            나와 주변 사람들의 보험을
            <br />
            직접 관리해보세요.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <ul className="space-y-3.5">
            {["내 상조", "부모님 상조", "자녀 / 반려동물상조까지"].map((label) => (
              <li
                key={label}
                className="flex items-center gap-4 bg-[#fafafa] text-[#222] rounded-[14px] px-6 py-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="relative w-[30px] h-[30px] rounded-full bg-[var(--accent)] shrink-0">
                  <i className="absolute left-[27%] top-[33%] w-[46%] h-[23%] border-l-[2.4px] border-b-[2.4px] border-white -rotate-45" />
                </span>
                <span className="text-[19px] font-extrabold">{label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
