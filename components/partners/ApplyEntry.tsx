import Link from "next/link";
import PartnerApplyShell from "@/components/partners/PartnerApplyShell";

export default function ApplyEntry({ resume = false, needRecert = false }: { resume?: boolean; needRecert?: boolean }) {
  return (
    <PartnerApplyShell step={resume ? 2 : 1} title="코드 발급 신청">
      <p className="partner-apply-lead">
        {needRecert
          ? "본인인증 유효 시간이 지났습니다. 다시 인증하면 계약서 작성을 이어갈 수 있습니다."
          : resume
            ? "이전에 진행하던 신청이 있습니다. 이어서 계약서 작성을 계속할 수 있습니다."
            : "GA 파트너스 코드를 받기 위해 아래 순서로 진행합니다."}
      </p>
      <ol className="partner-apply-steps">
        <li>
          <strong>본인인증</strong>
          <span>가입 정보와 휴대폰 명의를 확인합니다.</span>
        </li>
        <li>
          <strong>계약서 작성</strong>
          <span>위촉계약서를 읽고 인적사항·계좌를 작성한 뒤 전자서명합니다.</span>
        </li>
        <li>
          <strong>코드 발급</strong>
          <span>인증과 계약이 끝나면 파트너스 코드를 발급합니다.</span>
        </li>
      </ol>
      <div className="partner-apply-cta">
        <Link href={resume && !needRecert ? "/partners/apply/contract" : "/partners/apply/verify"} className="btn-apply">
          {needRecert ? "다시 본인인증" : resume ? "이어서 진행" : "신청 시작"}
        </Link>
      </div>
    </PartnerApplyShell>
  );
}
