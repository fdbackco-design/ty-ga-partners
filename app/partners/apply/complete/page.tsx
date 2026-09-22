import PartnerApplyShell from "@/components/partners/PartnerApplyShell";
import IssueComplete from "@/components/partners/IssueComplete";
import { getApplicationByUserId } from "@/lib/partnerApplicationsStore";
import { requireMemberUser } from "@/lib/partnerAccess";
import { isCompleteFlowStatus, publicIssueView } from "@/lib/partnerApplication";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "코드 발급 | TY파트너스 공식인증센터",
};

export default async function PartnersCompletePage() {
  const user = await requireMemberUser("/partners/apply/complete");
  const application = await getApplicationByUserId(user.id);
  if (!application || !isCompleteFlowStatus(application.status, application.signedAt)) {
    redirect("/partners/apply");
  }
  return (
    <PartnerApplyShell step={3} title="코드 발급">
      <IssueComplete initial={publicIssueView(application, user.username, user.rrnFront)} />
    </PartnerApplyShell>
  );
}
