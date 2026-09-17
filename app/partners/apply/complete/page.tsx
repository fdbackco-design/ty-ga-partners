import PartnerApplyShell from "@/components/partners/PartnerApplyShell";
import { requireMemberUser } from "@/lib/partnerAccess";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "코드 발급 완료 | TY파트너스 공식인증센터",
};

export default async function PartnersCompletePage() {
  await requireMemberUser("/partners/apply/complete");
  return (
    <PartnerApplyShell step={3} title="코드 발급">
      <p className="partner-apply-lead">이미 코드가 발급된 계정입니다. 추가 신청을 진행할 수 없습니다.</p>
    </PartnerApplyShell>
  );
}
