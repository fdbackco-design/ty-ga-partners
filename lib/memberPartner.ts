import { memberPartnerSummary, type MemberPartnerSummary } from "@/lib/partnerApplication";
import { getApplicationByUserId } from "@/lib/partnerApplicationsStore";

export async function loadMemberPartner(userId: string, username: string): Promise<MemberPartnerSummary> {
  try {
    const application = await getApplicationByUserId(userId);
    return memberPartnerSummary(application, username);
  } catch {
    return memberPartnerSummary(null, username);
  }
}
