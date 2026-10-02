import ContractAccountForm from "@/components/partners/ContractAccountForm";
import PartnerApplyShell from "@/components/partners/PartnerApplyShell";
import { contractStepReady, requireContractSession } from "@/lib/partnerAccess";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "전산 로그인 | TY파트너스 공식인증센터",
};

export default async function ContractAccountPage() {
  const { application, user } = await requireContractSession("/partners/apply/contract/account");
  if (!contractStepReady(application, "account")) redirect("/partners/apply/contract/info");
  return (
    <PartnerApplyShell step={3} of={5} title="전산 로그인" backHref="/partners/apply/contract/info">
      <ContractAccountForm empId={application.empId || user.username} hasPassword={Boolean(application.empPswdEnc)} />
    </PartnerApplyShell>
  );
}
