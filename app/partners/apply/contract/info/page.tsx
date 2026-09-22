import ContractInfoForm from "@/components/partners/ContractInfoForm";
import PartnerApplyShell from "@/components/partners/PartnerApplyShell";
import { contractStepReady, requireContractSession } from "@/lib/partnerAccess";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "인적사항 | TY파트너스 공식인증센터",
};

export default async function ContractInfoPage() {
  const { application } = await requireContractSession("/partners/apply/contract/info");
  if (!contractStepReady(application, "info")) redirect("/partners/apply/contract");
  return (
    <PartnerApplyShell step={2} of={4} title="인적사항" backHref="/partners/apply/contract">
      <ContractInfoForm
        name={application.certName || ""}
        phone={application.certMobile || ""}
        ssnFront={application.certBirthdate?.slice(2) || ""}
        ssnMasked={application.ssnMasked}
        zipCode={application.zipCode}
        address1={application.address1}
        address2={application.address2}
      />
    </PartnerApplyShell>
  );
}
