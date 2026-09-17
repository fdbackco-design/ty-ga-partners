import PartnerApplyShell from "@/components/partners/PartnerApplyShell";
import { requireVerifiedAccess } from "@/lib/partnerAccess";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "위촉계약서 | TY파트너스 공식인증센터",
};

export default async function PartnersContractPage() {
  await requireVerifiedAccess("/partners/apply/contract");
  return (
    <PartnerApplyShell step={2} title="위촉계약서" backHref="/partners/apply">
      <p className="partner-apply-lead">위촉계약서 작성은 다음 단계에서 진행됩니다.</p>
    </PartnerApplyShell>
  );
}
