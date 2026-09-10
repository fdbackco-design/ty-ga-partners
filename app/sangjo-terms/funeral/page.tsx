import LegalHtml from "@/components/LegalHtml";
import LegalLayout from "@/components/LegalLayout";
import { HTML } from "@/lib/legal/funeralHtml";

export const metadata = {
  title: "상조 이용약관 | TY파트너스 공식인증센터",
};

export default function FuneralTermsPage() {
  return (
    <LegalLayout title="상조 이용약관" wide>
      <LegalHtml html={HTML} />
    </LegalLayout>
  );
}
