import Reveal from "../Reveal";

const BEFORE = ["두 검사가 따로", "결과 형식도 제각각", "한눈에 이해 어려움"];

const STEPS = [
  {
    n: "01",
    image: "/images/cancer-step-1.jpg",
    position: "72% 70%",
    title: (
      <>
        하나의 기준으로
        <br className="md:hidden" /> 정렬
      </>
    ),
    desc: (
      <>
        <span className="max-md:hidden">
          8대 암 기준으로 <em>같은 구조로 정렬</em>
        </span>
        <span className="md:hidden">
          8대 암 기준
          <br />
          <em>같은 구조로 정렬</em>
        </span>
      </>
    ),
  },
  {
    n: "02",
    image: "/images/cancer-step-2.jpg",
    position: "78% 62%",
    title: (
      <>
        현재와 미래를
        <br className="md:hidden" /> 한 번에
      </>
    ),
    desc: (
      <>
        <span className="max-md:hidden">
          종양표지자·유전자를 <em>한 화면에서 확인</em>
        </span>
        <span className="md:hidden">
          표지자·유전자
          <br />
          <em>한 화면에서 확인</em>
        </span>
      </>
    ),
  },
  {
    n: "03",
    image: "/images/cancer-step-3.jpg",
    position: "center 40%",
    title: (
      <>
        상담·관리까지
        <br className="md:hidden" /> 연결
      </>
    ),
    desc: (
      <>
        <span className="max-md:hidden">
          설명부터 후속관리까지 <em>하나의 흐름으로</em>
        </span>
        <span className="md:hidden">
          상담부터 관리까지
          <br />
          <em>하나의 흐름으로</em>
        </span>
      </>
    ),
  },
];

const FOOTER = [
  {
    id: "eight",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    label: (
      <>
        8대 암을
        <br className="md:hidden" /> 한 번에
      </>
    ),
  },
  {
    id: "future",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <circle cx="8" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16" cy="8" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16" cy="16.5" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10.8 10.6 13.7 8.8M10.8 13.4l2.9 1.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
    label: (
      <>
        현재 + 미래
        <br className="md:hidden" /> 통합 분석
      </>
    ),
  },
  {
    id: "care",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 3.6v2.4M12 18v2.4M4.8 6.4l1.7 1.7M17.5 15.9l1.7 1.7M3.6 12h2.4M18 12h2.4M4.8 17.6l1.7-1.7M17.5 8.1l1.7-1.7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    label: (
      <>
        맞춤형
        <br className="md:hidden" /> 예방·관리
      </>
    ),
  },
];

export default function Cancer() {
  return (
    <section className="cancer" id="cancer">
      <div className="wrap">
        <Reveal>
          <h2 className="section-label text-center text-[36px]">ALL LIFE CARE 암검사</h2>
          <p className="cancer-lead">
            ALL LIFE 암검사는 종양표지자 검사와 유전적 질환위험 정보를 8대 암 기준으로 한 화면에 통합 배치하여, 더 직관적인 해석 인터페이스를 제공합니다.
          </p>
        </Reveal>

        <Reveal>
          <div className="cancer-before">
            <div className="cancer-before-label">
              <strong>기존 방식</strong>
              <span>BEFORE</span>
            </div>
            <ul>
              {BEFORE.map((item) => (
                <li key={item}>
                  <span aria-hidden>×</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal>
          <p className="cancer-bridge">ALL LIFE 암검사는 이렇게 다릅니다</p>
        </Reveal>

        <div className="cancer-steps">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 80} className="cancer-step-wrap">
              {i > 0 ? <span className="cancer-arrow" aria-hidden /> : null}
              <article className="cancer-card">
                <div className="cancer-card-photo">
                  <img src={step.image} alt="" width={2400} height={1792} style={{ objectPosition: step.position }} />
                  <span className="cancer-num">{step.n}</span>
                </div>
                <div className="cancer-card-body">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={160}>
          <ul className="cancer-footer">
            {FOOTER.map((item) => (
              <li key={item.id}>
                {item.icon}
                {item.label}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
