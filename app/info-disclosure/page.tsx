import LegalLayout from "@/components/LegalLayout";
import { INFO_DISCLOSURE } from "@/lib/data";

export const metadata = {
  title: "정보공개 | TY파트너스 공식인증센터",
};

export default function InfoDisclosurePage() {
  return (
    <LegalLayout title="정보공개">
      <ul className="legal-list">
        {INFO_DISCLOSURE.map((item) => (
          <li key={item.year}>
            <a href={item.href} target="_blank" rel="noreferrer">
              <span>
                <strong>{item.title}</strong>
                <em>{item.excerpt}</em>
              </span>
              <span>{item.date}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="legal-note mt-6">첨부 파일(외부회계감사보고서 PDF)은 원문 게시글에서 확인할 수 있습니다.</p>
    </LegalLayout>
  );
}
