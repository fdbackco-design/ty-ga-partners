import Reveal from "../Reveal";

const COLS = [
  {
    title: "사업비를 최소화하는 구조",
    mobileTitle: (
      <>
        사업비를
        <br />
        최소화하는 구조
      </>
    ),
    icon: "hand-coins" as const,
    body: ["중간관리자에게 지급될 재원을", "스스로 영업하는 설계사에게 전액 지급"],
    mobileBody: ["관리 재원을", "설계사에 전액 지급"],
  },
  {
    title: "최적화된 영업플랫폼 구축",
    mobileTitle: (
      <>
        최적화된
        <br />
        영업플랫폼 구축
      </>
    ),
    icon: "handshake" as const,
    body: ["파트너가 직접 TY본사와 일하는 구조", "중간 유통과정이 없는 1:1 구조"],
    mobileBody: ["본사와 직접 일함", "중간 없는 1:1 구조"],
  },
  {
    title: "혼자하는 영업이 아닌 함께하는 영업",
    mobileTitle: (
      <>
        혼자하는 영업이
        <br />
        아닌 함께하는 영업
      </>
    ),
    icon: "users" as const,
    body: [
      "파트너스 자격 시험 X 누구나 가능",
      "코드등록 절차는 간편하게 누구나 가능",
      "전담 CS팀 배정으로 모든 과정 누구나 지원",
    ],
    mobileBody: ["자격 시험 없이 가능", "CS가 전 과정 지원"],
    note: "*TY Life 본사 파트너스 공식인증센터",
  },
];

const EMPHASIS = ["전액 지급", "1:1 구조"] as const;

function StructureLine({ text }: { text: string }) {
  const mark = EMPHASIS.find((item) => text.includes(item));
  if (!mark) return <p>{text}</p>;
  const at = text.indexOf(mark);
  return (
    <p>
      {text.slice(0, at)}
      <strong>{mark}</strong>
      {text.slice(at + mark.length)}
    </p>
  );
}

function StructureIcon({ name }: { name: (typeof COLS)[number]["icon"] }) {
  return (
    <div className="structure-icon" aria-hidden="true">
      {name === "hand-coins" ? (
        <svg viewBox="0 0 24 24">
          <circle cx="6" cy="5" r="3" fill="currentColor" fillOpacity="0.1" />
          <circle cx="16" cy="9" r="2.9" fill="currentColor" fillOpacity="0.1" />
          <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
          <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
          <path d="m2 16 6 6" />
        </svg>
      ) : null}
      {name === "handshake" ? (
        <img src="/images/structure-handshake.png" alt="" />
      ) : null}
      {name === "users" ? (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="2.35" fill="currentColor" fillOpacity="0.1" />
          <path d="M8.2 18.6c.45-2.5 2.15-4 3.8-4s3.35 1.5 3.8 4" />
          <circle cx="5.1" cy="9.2" r="2" />
          <path d="M2.4 18.6c.3-2 1.55-3.35 3.15-3.35" />
          <circle cx="18.9" cy="9.2" r="2" />
          <path d="M18.45 15.25c1.6 0 2.85 1.35 3.15 3.35" />
        </svg>
      ) : null}
    </div>
  );
}

export default function Structure() {
  return (
    <section id="Structure" className="structure">
      <div className="wrap text-center">
        <Reveal>
          <p className="section-label">1인 TY-GA파트너스</p>
          <h2 className="section-title xl mt-3">사업구조</h2>
        </Reveal>
        <div className="structure-grid">
          {COLS.map((col, i) => (
            <Reveal key={col.title} className="h-full min-w-0" delay={i * 90}>
              <article className="structure-item">
                <h3>
                  <span className="max-md:hidden">{col.title}</span>
                  <span className="md:hidden">{col.mobileTitle ?? col.title}</span>
                </h3>
                <StructureIcon name={col.icon} />
                <div className="structure-body structure-body-desktop">
                  {col.body.map((line) => (
                    <StructureLine key={line} text={line} />
                  ))}
                </div>
                <div className="structure-body structure-body-mobile">
                  {col.mobileBody.map((line) => (
                    <StructureLine key={line} text={line} />
                  ))}
                </div>
                {col.note ? <p className="structure-note">{col.note}</p> : null}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
