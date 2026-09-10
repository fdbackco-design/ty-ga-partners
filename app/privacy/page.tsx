import LegalLayout from "@/components/LegalLayout";
import PrivacyPolicyBox from "@/components/PrivacyPolicyBox";

export const metadata = {
  title: "개인정보 취급방침 | TY파트너스 공식인증센터",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="개인정보 취급방침">
      <PrivacyPolicyBox />
    </LegalLayout>
  );
}
