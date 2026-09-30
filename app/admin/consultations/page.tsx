import Link from "next/link";
import { redirect } from "next/navigation";
import ConsultBoard from "@/components/ConsultBoard";
import { getAdminFromCookies } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "상담관리 | TY파트너스 공식인증센터",
};

export default async function AdminConsultationsPage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/login?next=/admin/consultations");
  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / 상담관리
        </p>
        <h1 className="legal-title">상담관리</h1>
        <p className="mt-3 text-[var(--sub)]">접수된 상담신청을 확인하고 답글을 남겨 주세요.</p>
        <div className="legal-body is-wide">
          <ConsultBoard itemHrefBase="/admin/consultations" showWrite={false} />
        </div>
      </div>
    </main>
  );
}
