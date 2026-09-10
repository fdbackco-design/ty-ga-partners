import Link from "next/link";
import InquiryForm from "@/components/InquiryForm";

export const metadata = {
  title: "문의 작성 | TY파트너스 공식인증센터",
};

export default function NewInquiryPage() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / <Link href="/inquiries">문의 남기기</Link> / 작성
        </p>
        <h1 className="legal-title">문의 작성</h1>
        <p className="mt-3 text-[var(--sub)]">이미지와 파일을 함께 첨부할 수 있습니다.</p>
        <div className="mt-10">
          <InquiryForm />
        </div>
      </div>
    </main>
  );
}
