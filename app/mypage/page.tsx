import MyPageAccount from "@/components/MyPageAccount";
import { requireMemberUser } from "@/lib/partnerAccess";
import { getApplicationByUserId, phoneChangeLocked } from "@/lib/partnerApplicationsStore";
import { listPhoneHistory } from "@/lib/usersStore";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "마이페이지 | TY파트너스 공식인증센터",
};

export default async function MyPage() {
  const user = await requireMemberUser("/mypage");
  const application = await getApplicationByUserId(user.id);
  let phoneHistory: Awaited<ReturnType<typeof listPhoneHistory>> = [];
  let historyError = "";
  try {
    phoneHistory = await listPhoneHistory(user.id);
  } catch (error) {
    historyError = error instanceof Error ? error.message : "이전 번호를 불러오지 못했습니다.";
  }
  return (
    <main className="auth-page">
      <div className="wrap">
        <p className="text-center text-[15px] font-extrabold text-[var(--accent)] tracking-[0.04em]">
          TY 1인 GA 파트너스
        </p>
        <h1 className="text-center text-[36px] md:text-[44px] font-extrabold tracking-[-0.04em] mt-3">마이페이지</h1>
        <p className="mt-3 text-center text-[var(--sub)]">가입 정보와 비밀번호를 관리할 수 있습니다.</p>
        {historyError ? <p className="mt-4 text-center text-sm text-[#dc3545]">{historyError}</p> : null}
        <div className="mt-10">
          <MyPageAccount
            username={user.username}
            name={user.name}
            phone={user.phone}
            phoneLocked={phoneChangeLocked(application)}
            phoneHistory={phoneHistory}
          />
        </div>
      </div>
    </main>
  );
}
