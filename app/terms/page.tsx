import LegalLayout from "@/components/LegalLayout";
import TermsContent from "@/components/legal/TermsContent";

export const metadata = {
  title: "이용약관 | TY파트너스 공식인증센터",
};

export default function TermsPage() {
  return (
    <LegalLayout title="이용약관">
      <TermsContent />
    </LegalLayout>
  );
}
