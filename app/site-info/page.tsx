import LegalLayout from "@/components/LegalLayout";
import SiteInfoContent from "@/components/legal/SiteInfoContent";

export const metadata = {
  title: "홈페이지 정보이용 | TY파트너스 공식인증센터",
};

export default function SiteInfoPage() {
  return (
    <LegalLayout title="홈페이지 정보이용">
      <SiteInfoContent />
    </LegalLayout>
  );
}
