import Link from "next/link";
import PartnerApplyShell from "@/components/partners/PartnerApplyShell";

export default function ApplyEntry() {
  return (
    <PartnerApplyShell step={1} title="코드 발급 신청">
      <p className="partner-apply-lead">GA 파트너스 코드를 받기 위해 아래 순서로 진행합니다.</p>
      <ol className="partner-apply-steps">
        <li>
          <strong>본인인증</strong>
          <span>가입 정보와 휴대폰 명의를 확인합니다.</span>
        </li>
        <li>
          <strong>계약서 작성</strong>
          <span>위촉계약서 작성과 서명은 다음 단계에서 진행합니다.</span>
        </li>
        <li>
          <strong>코드 발급</strong>
          <span>인증과 계약이 끝나면 파트너스 코드를 발급합니다.</span>
        </li>
      </ol>
      <div className="partner-apply-cta">
        <Link href="/partners/apply/verify" className="btn-apply">
          신청 시작
        </Link>
      </div>
    </PartnerApplyShell>
  );
}
