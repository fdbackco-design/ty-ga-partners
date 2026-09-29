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
          <Link href="/">홈</Link> / 채널 관리
        </p>
        <h1 className="legal-title">채널 관리</h1>
        <p className="mt-3 text-[var(--sub)]">
          채널을 만들면 가입 URL이 발급됩니다. 이 URL로 들어온 사용자의 채널 값이 회원가입과 사원등록에 저장됩니다.
          이름과 URL 파라미터, 조직코드는 수정할 수 있고, 잘못 만든 채널은 삭제할 수 있습니다. 기본 채널(channel1)은
          이름과 조직코드만 바꿀 수 있으며, 이미 가입·신청에 쓰인 채널은 삭제 대신 비활성화해 주세요. 조직코드를
          비우면 611361(GA파트너스)로 저장되고, 이 값이 사원등록 요청의 orgCode로 넘어갑니다.
        </p>
        <div className="mt-10">
          <ChannelAdmin />
        </div>
      </div>
    </main>
  );
}
