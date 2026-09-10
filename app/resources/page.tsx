import Link from "next/link";
import ResourcesBoard from "@/components/ResourcesBoard";

export const metadata = {
  title: "자료실 | TY파트너스 공식인증센터",
};

export default function ResourcesPage() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / 자료실
        </p>
        <h1 className="legal-title">자료실</h1>
        <p className="mt-3 text-[var(--sub)]">로그인 없이도 자료를 확인하고 내려받을 수 있습니다.</p>
        <div className="legal-body is-wide">
          <ResourcesBoard />
        </div>
      </div>
    </main>
  );
}
