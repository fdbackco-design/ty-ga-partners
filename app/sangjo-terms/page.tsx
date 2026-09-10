import Link from "next/link";
import LegalLayout from "@/components/LegalLayout";
import { SANGJO_TERMS } from "@/lib/data";

export const metadata = {
  title: "상조&크루즈 이용약관 | TY파트너스 공식인증센터",
};

export default function SangjoTermsPage() {
  return (
    <LegalLayout title="상조&크루즈 이용약관">
      <ul className="legal-list">
        {SANGJO_TERMS.map((item) => (
          <li key={item.slug}>
            <Link href={`/sangjo-terms/${item.slug}`}>
              <span>
                <strong>{item.title}</strong>
                <em>{item.excerpt}</em>
              </span>
              <span>자세히 보기</span>
            </Link>
          </li>
        ))}
      </ul>
    </LegalLayout>
  );
}
