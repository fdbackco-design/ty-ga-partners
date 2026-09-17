import VerifyCert from "@/components/partners/VerifyCert";
import { isVerifiedOrLater } from "@/lib/partnerApplicationsStore";
import { requireApplyAccess } from "@/lib/partnerAccess";
import { maskName, maskPhone } from "@/lib/partnerCert";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "본인인증 | TY파트너스 공식인증센터",
};

export default async function PartnersVerifyPage() {
  const { user, application } = await requireApplyAccess("/partners/apply/verify");
  if (isVerifiedOrLater(application)) redirect("/partners/apply/contract");
  return <VerifyCert maskedName={maskName(user.name)} maskedPhone={maskPhone(user.phone)} />;
}
