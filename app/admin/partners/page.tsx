import Link from "next/link";
import { redirect } from "next/navigation";
import PartnerAdminList from "@/components/admin/PartnerAdminList";
import { getAdminFromCookies } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "파트너 신청 관리 | TY파트너스 공식인증센터",
};

export default async function AdminPartnersPage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/login?next=/admin/partners");
  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / 파트너 신청
        </p>
        <h1 className="legal-title">파트너 신청</h1>
        <p className="mt-3 text-[var(--sub)]">수동 확인이 필요한 건부터 처리하세요. TY 사원등록은 취소할 수 없습니다.</p>
        <div className="mt-10">
          <PartnerAdminList />
        </div>
      </div>
    </main>
  );
}
