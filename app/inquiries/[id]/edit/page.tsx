import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import InquiryForm from "@/components/InquiryForm";
import { canManageInquiry, canViewInquiry, toPublicInquiry } from "@/lib/inquiries";
import { getInquiry } from "@/lib/inquiriesStore";
import { getViewer } from "@/lib/viewer";

export const metadata = {
  title: "문의 수정 | TY파트너스 공식인증센터",
};

export const dynamic = "force-dynamic";

export default async function EditInquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=/inquiries/${id}/edit`);
  const item = await getInquiry(id);
  if (!item || !canViewInquiry(item, viewer)) notFound();
  if (!canManageInquiry(item, viewer)) redirect(`/inquiries/${id}`);

  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / <Link href="/inquiries">문의 게시판</Link> /{" "}
          <Link href={`/inquiries/${id}`}>{item.title}</Link> / 수정
        </p>
        <h1 className="legal-title">문의 수정</h1>
        <p className="mt-3 text-[var(--sub)]">제목, 내용, 첨부 파일, 비밀글 여부를 바꿀 수 있습니다.</p>
        <div className="mt-10">
          <InquiryForm item={toPublicInquiry(item, viewer)} />
        </div>
      </div>
    </main>
  );
}
