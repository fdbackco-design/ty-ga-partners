import Reveal from "../Reveal";

const COLS = [
  {
    title: "사업비를 최소화하는 구조",
    body: ["중간관리자에게 지급될 재원을", "스스로 영업하는 설계사에게 전액 지급"],
  },
  {
    title: "최적화된 영업플랫폼 구축",
    body: ["파트너가 직접 TY본사와 일하는 구조", "중간 유통과정이 없는 1:1 구조"],
  },
  {
    title: "혼자하는 영업이 아닌 함께하는 영업",
    body: [
      "파트너스 자격 시험 X 누구나 가능",
      "코드등록 절차는 간편하게 누구나 가능",
      "전담 CS팀 배정으로 모든 과정 누구나 지원",
    ],
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
            <Reveal key={col.title} delay={i * 90}>
              <article className="structure-item">
                <h3>{col.title}</h3>
                <div className="structure-body">
                  {col.body.map((line) => (
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
