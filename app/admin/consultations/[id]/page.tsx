import { redirect } from "next/navigation";
import ConsultDetail from "@/components/ConsultDetail";
import { getAdminFromCookies } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "상담관리 상세 | TY파트너스 공식인증센터",
};

export default async function AdminConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await getAdminFromCookies();
  if (!admin) redirect(`/login?next=/admin/consultations/${id}`);
  return (
    <main className="legal-page inquiry-ticket-page">
      <div className="wrap">
        <ConsultDetail id={id} listHref="/admin/consultations" listLabel="상담관리" />
      </div>
    </main>
  );
}
