import { decryptSecret } from "@/lib/crypto";
import { publicIssueView, type PartnerApplication } from "@/lib/partnerApplication";

export function memberIssueView(application: PartnerApplication, username: string, ssnFront?: string) {
  let empPswd = "";
  try {
    empPswd = application.empPswdEnc ? decryptSecret(application.empPswdEnc) : "";
  } catch {
    empPswd = "";
  }
  return publicIssueView(application, application.empId || username, ssnFront, empPswd);
}

export function memberSystemLogin(application: PartnerApplication | null, username: string) {
  if (!application || application.status !== "ISSUED") return null;
  let empPswd = "";
  try {
    empPswd = application.empPswdEnc ? decryptSecret(application.empPswdEnc) : "";
  } catch {
    empPswd = "";
  }
  return {
    empId: application.empId || username,
    empPswd,
  };
}
