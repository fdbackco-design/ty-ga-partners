import LegalLayout from "@/components/LegalLayout";

export const metadata = {
  title: "중요정보 고시사항 | TY파트너스 공식인증센터",
};

export default function DisclosureNoticePage() {
  return (
    <LegalLayout title="중요정보 고시사항">
      <div className="legal-notice">
        <p className="legal-kicker">2025년 12월말 기준</p>

        <h3>■ 중도해약환급금에 대한 환급기준 및 환급시기</h3>
        <table>
          <tbody>
            <tr>
              <th>환급 기준</th>
              <td>선불식할부계약의 해제에 따른 해약환급금 산정기준 고시에 따름</td>
            </tr>
            <tr>
              <th>환급 시기</th>
              <td>환급금액은 신청일로부터 제3영업일에 수령할 수 있음</td>
            </tr>
          </tbody>
        </table>

        <h3>■ 구체적인 제공물품 및 서비스 내용</h3>
        <h4>1) 반려동물장례</h4>
        <p>
          <strong>가.</strong> 수의 원단 제조에 소요되는 원사의 종류, 구성비율 및 원산지 등
        </p>
        <table>
          <tbody>
            <tr>
              <th>원사의 종류 · 구성비율 · 원산지</th>
              <td>면 100% (국산) · 기계직</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>나.</strong> 관의 재질 및 원산지 — 오동나무 100% (중국산)
        </p>
        <p>
          <strong>다.</strong> 픽업서비스 차량의 종류 — QM6, 아이오닉5, 스타렉스
        </p>

        <h4>2) 태양라이프 의전용 장례</h4>
        <p>
          <strong>가.</strong> 수의 원단 제조에 소요되는 원사의 종류, 구성비율 및 원산지 등
        </p>
        <table>
          <tbody>
            <tr>
              <th>원사의 종류 · 구성비율 · 원산지</th>
              <td>대마 100% (중국산)</td>
            </tr>
            <tr>
              <th>제조 방법</th>
              <td>기계식 또는 수자제품임</td>
            </tr>
            <tr>
              <th>제조 지역</th>
              <td>국내산</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>나.</strong> 관의 재질과 두께 및 원산지
        </p>
        <table>
          <tbody>
            <tr>
              <th>매장 시</th>
              <td>오동나무 (중국산) · 두께 3cm</td>
            </tr>
            <tr>
              <th>화장 시</th>
              <td>오동나무 (중국산) · 두께 1.5cm</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>다.</strong> 차량의 종류 및 무료로 제공되는 차량거리
        </p>
        <table>
          <tbody>
            <tr>
              <th>운구 리무진 200km</th>
              <td>링컨타운카 또는 캐딜락 (2007~2017년식)</td>
            </tr>
            <tr>
              <th>유족전용 장의버스 200km</th>
              <td>현대 또는 기아 (2007~2016년식) 위 두 차량 중 택 1</td>
            </tr>
          </tbody>
        </table>
        <p className="legal-note">* 택 1 제품의 차량 변경 시 동급으로 대체될 수 있습니다.</p>
        <p>
          <strong>라.</strong> 서비스에 제공되는 인력 및 인력 추가 시 요구되는 비용
        </p>
        <table>
          <tbody>
            <tr>
              <th>장례지도사 1명</th>
              <td>1일차 출동 및 상담, 2일차 입관 진행</td>
            </tr>
            <tr>
              <th>전문도우미 4명 · 8시간</th>
              <td>인력 추가 시 1명당 시간당 12,000원</td>
            </tr>
          </tbody>
        </table>
        <p className="legal-note">* 행사 시기(근로소득 인상)에 따라 차이가 있을 수 있습니다.</p>

        <h3>■ 총 고객환급 의무액 및 상조 관련 자산</h3>
        <table>
          <tbody>
            <tr>
              <th>총 고객환급 금액</th>
              <td className="legal-amount">7,344,086,587 원</td>
            </tr>
            <tr>
              <th>상조 관련 자산</th>
              <td className="legal-amount">9,980,980,041 원</td>
            </tr>
          </tbody>
        </table>
        <p>위 금액은 2025년 12월말 기준이며, 도경회계법인으로부터 외부감사를 받았습니다.</p>

        <h3>■ 고객불입금에 대한 관리방법</h3>
        <p>
          상조보증공제조합에서 소비자 피해보상을 위한 공제계약을 체결하여, 고객불입금의 50%를
          상조보증공제조합에 보전하고 있습니다.
        </p>
        <table>
          <tbody>
            <tr>
              <th>상조보증공제조합 문의</th>
              <td>1600-1226</td>
            </tr>
          </tbody>
        </table>
      </div>
    </LegalLayout>
  );
}
