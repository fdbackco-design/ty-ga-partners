import ContractBankForm from "@/components/partners/ContractBankForm";
import PartnerApplyShell from "@/components/partners/PartnerApplyShell";
import { contractStepReady, requireContractSession } from "@/lib/partnerAccess";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "정산 계좌 | TY파트너스 공식인증센터",
};

export default async function ContractBankPage() {
  const { application } = await requireContractSession("/partners/apply/contract/bank");
  if (!contractStepReady(application, "bank")) redirect("/partners/apply/contract/info");
  return (
    <PartnerApplyShell step={3} of={4} title="정산 계좌" backHref="/partners/apply/contract/info">
      <ContractBankForm
        name={application.certName || ""}
        bankCode={application.bankCode}
        accountNoMasked={application.accountNoMasked}
        accountHolder={application.accountHolder}
        bizRegNo={application.bizRegNo}
      />
    </PartnerApplyShell>
  );
}
