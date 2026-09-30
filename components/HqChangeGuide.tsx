import { COMPANY } from "@/lib/data";

const HQ_PHONE_TEL = COMPANY.customerCenter.replace(/-/g, "");

export default function HqChangeGuide() {
  return (
    <aside className="hq-change-guide" aria-label="본사 문의 안내">
      <p>이름, 주민등록번호, 휴대폰 번호, 정산 계좌, 주소 변경이 필요한 경우 본사로 문의해 주세요.</p>
      <p className="hq-change-guide-phone">
        본사 고객센터:{" "}
        <a href={`tel:${HQ_PHONE_TEL}`}>{COMPANY.customerCenter}</a>
      </p>
    </aside>
  );
}
