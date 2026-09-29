import { isContractLocked } from "@/lib/partnerApplicationsStore";
import type { PartnerApplication } from "@/lib/partnerApplication";

export const MEMBER_WITHDRAW_BLOCKED =
  "위촉계약이 체결되었거나 사원코드가 발급된 계정은 마이페이지에서 탈퇴할 수 없습니다. 해촉 신청을 이용해 주세요.";

export function memberWithdrawBlocked(application: PartnerApplication | null) {
  return isContractLocked(application);
}
