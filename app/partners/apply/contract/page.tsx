import ContractReader from "@/components/partners/ContractReader";
import PartnerApplyShell from "@/components/partners/PartnerApplyShell";
import { requireContractSession } from "@/lib/partnerAccess";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "위촉계약서 동의 | TY파트너스 공식인증센터",
};

export default async function ContractAgreePage() {
  const { application } = await requireContractSession("/partners/apply/contract");
  return (
    <PartnerApplyShell step={1} of={4} title="계약서 동의" backHref="/partners/apply" className="is-contract-read">
      <ContractReader alreadyAgreed={Boolean(application.privacyAgreed)} />
    </PartnerApplyShell>
  );
}
