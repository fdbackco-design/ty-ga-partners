import SignaturePad from "@/components/partners/SignaturePad";
import PartnerApplyShell from "@/components/partners/PartnerApplyShell";
import { contractStepReady, requireContractSession } from "@/lib/partnerAccess";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "전자서명 | TY파트너스 공식인증센터",
};

export default async function ContractSignPage() {
  const { application } = await requireContractSession("/partners/apply/contract/sign");
  if (!contractStepReady(application, "sign")) redirect("/partners/apply/contract/bank");
  return (
    <PartnerApplyShell step={4} of={4} title="전자서명" backHref="/partners/apply/contract/bank">
      <p className="partner-apply-lead">흰 화면에 서명해 주세요. 확인하면 계약서 3곳에 같은 서명이 들어갑니다.</p>
      <SignaturePad />
    </PartnerApplyShell>
  );
}
