import ConsultDetail from "@/components/ConsultDetail";

export const metadata = {
  title: "상담신청 상세 | TY파트너스 공식인증센터",
};

export default async function ConsultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="legal-page inquiry-ticket-page">
      <div className="wrap">
        <ConsultDetail id={id} />
      </div>
    </main>
  );
}
