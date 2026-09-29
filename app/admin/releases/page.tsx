import Link from "next/link";
import { redirect } from "next/navigation";
import ReleaseAdminList from "@/components/admin/ReleaseAdminList";
import { getAdminFromCookies } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "해촉관리 | TY파트너스 공식인증센터",
};

export default async function AdminReleasesPage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/login?next=/admin/releases");
  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / 해촉관리
        </p>
        <h1 className="legal-title">해촉관리</h1>
        <p className="mt-3 text-[var(--sub)]">해촉 신청 내용을 확인하고 처리 상태를 바꿔 주세요.</p>
        <div className="mt-10">
          <ReleaseAdminList />
        </div>
      </div>
    </main>
  );
}
