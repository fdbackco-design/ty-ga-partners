import LegalLayout from "@/components/LegalLayout";
import ReleaseRequestForm from "@/components/ReleaseRequestForm";
import { COMPANY } from "@/lib/data";

export const metadata = {
  title: "해촉신청 | TY파트너스 공식인증센터",
};

export default function ReleaseRequestPage() {
  return (
    <LegalLayout title="해촉신청">
      <p className="mb-8">{COMPANY.slogan}</p>
      <ReleaseRequestForm />
    </LegalLayout>
  );
}
