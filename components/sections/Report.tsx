import Reveal from "../Reveal";

const POINTS = ["암종별\n동일 배치", "종양표지자 + 유전자\n결과 동시 제시", "한 화면 요약\n인터페이스"];

export default function Report() {
  return (
    <section className="report">
      <div className="wrap">
        <Reveal>
          <div className="report-head">
            <p className="report-pill">레포트를 활용한 보험보장분석 설계</p>
            <h2>한국인 8대 암 통합 스크리닝 검사 결과 요약지</h2>
          </div>
        </Reveal>

        <div className="report-stage">
          <Reveal>
            <div className="report-board">
              <img src="/images/report.png" alt="검사 결과 요약지" width={980} height={1380} />
            </div>
          </Reveal>
          <div className="report-points">
            {POINTS.map((text, i) => (
              <Reveal key={text} delay={i * 90}>
                <div className="report-point">
                  <p>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <p className="report-note">
          본 이미지는 ALL LIFE 통합 암 검진 리포트 결과 요약지의 예시이며, 표기된 인적사항·검사일·결과값은
          예시 데이터입니다.
        </p>
      </div>
    </section>
  );
}
