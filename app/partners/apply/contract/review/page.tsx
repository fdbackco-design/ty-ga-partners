import ContractReview from "@/components/partners/ContractReview";
import PartnerApplyShell from "@/components/partners/PartnerApplyShell";
import { contractStepReady, requireContractSession } from "@/lib/partnerAccess";
import { publicContractDraft } from "@/lib/partnerApplication";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "계약 확인 | TY파트너스 공식인증센터",
};

export default async function ContractReviewPage() {
  const { application } = await requireContractSession("/partners/apply/contract/review");
  if (!contractStepReady(application, "review")) redirect("/partners/apply/contract/sign");
  return (
    <PartnerApplyShell step={4} of={4} title="최종 확인" backHref="/partners/apply/contract/sign">
      <ContractReview draft={publicContractDraft(application)} />
    </PartnerApplyShell>
  );
}
