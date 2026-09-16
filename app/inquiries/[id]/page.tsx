import InquiryDetail from "@/components/InquiryDetail";

export const metadata = {
  title: "문의 상세 | TY파트너스 공식인증센터",
};

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="legal-page inquiry-ticket-page">
      <div className="wrap">
        <InquiryDetail id={id} />
      </div>
    </main>
  );
}
