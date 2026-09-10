import LegalHtml from "@/components/LegalHtml";
import LegalLayout from "@/components/LegalLayout";
import { HTML } from "@/lib/legal/cruiseHtml";

export const metadata = {
  title: "크루즈 여행 이용약관 | TY파트너스 공식인증센터",
};

export default function CruiseTermsPage() {
  return (
    <LegalLayout title="크루즈 여행 이용약관" wide>
      <LegalHtml html={HTML} />
    </LegalLayout>
  );
}
