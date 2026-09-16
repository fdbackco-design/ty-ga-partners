import Link from "next/link";
import { redirect } from "next/navigation";
import ResourceForm from "@/components/ResourceForm";
import { getAdminFromCookies } from "@/lib/admin";

export const metadata = {
  title: "자료 등록 | TY파트너스 공식인증센터",
};

export const dynamic = "force-dynamic";

export default async function NewResourcePage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/resources");

  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / <Link href="/resources">자료실</Link> / 작성
        </p>
        <h1 className="legal-title">자료 등록</h1>
        <p className="mt-3 text-[var(--sub)]">내용에 이미지를 넣고, 자료 파일을 함께 등록할 수 있습니다.</p>
        <div className="mt-10">
          <ResourceForm />
        </div>
      </div>
    </main>
  );
}
