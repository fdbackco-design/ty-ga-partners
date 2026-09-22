import Link from "next/link";
import { redirect } from "next/navigation";
import ChannelAdmin from "@/components/admin/ChannelAdmin";
import { getAdminFromCookies } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "채널 관리 | TY파트너스 공식인증센터",
};

export default async function AdminChannelsPage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/login?next=/admin/channels");
  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / <Link href="/admin/partners">파트너 신청</Link> / 채널 관리
        </p>
        <h1 className="legal-title">채널 관리</h1>
        <p className="mt-3 text-[var(--sub)]">
          채널을 만들면 가입 URL이 발급됩니다. 이 URL로 들어온 사용자의 채널 값이 회원가입과 사원등록에 저장됩니다.
        </p>
        <div className="mt-10">
          <ChannelAdmin />
        </div>
      </div>
    </main>
  );
}
