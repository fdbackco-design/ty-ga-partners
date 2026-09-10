import Link from "next/link";
import InquiryBoard from "@/components/InquiryBoard";

export const metadata = {
  title: "문의 남기기 | TY파트너스 공식인증센터",
};

export default function InquiriesPage() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / 문의 남기기
        </p>
        <h1 className="legal-title">문의 남기기</h1>
        <p className="mt-3 text-[var(--sub)]">
          로그인 후 문의를 남길 수 있습니다. 비밀글은 작성자와 관리자만 확인할 수 있습니다.
        </p>
        <div className="legal-body is-wide">
          <InquiryBoard />
        </div>
      </div>
    </main>
  );
}
