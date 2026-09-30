import ConsultBoard from "@/components/ConsultBoard";
import ConsultForm from "@/components/ConsultForm";
import Link from "next/link";

export const metadata = {
  title: "상담신청 | TY파트너스 공식인증센터",
};

export default function ConsultPage() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / 상담신청
        </p>
        <h1 className="legal-title">상담신청</h1>
        <p className="mt-3 text-[var(--sub)]">
          로그인 없이 상담을 남길 수 있습니다. 내용은 신청자와 관리자만 확인할 수 있습니다.
        </p>
        <div className="mt-10">
          <ConsultForm />
        </div>
        <div className="legal-body is-wide mt-16">
          <ConsultBoard />
        </div>
      </div>
    </main>
  );
}
