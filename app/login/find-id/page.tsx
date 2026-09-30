import AccountRecoverForm from "@/components/AccountRecoverForm";
import { partnerCertStubEnabled } from "@/lib/partnerCertStub";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "아이디 찾기 | TY파트너스 공식인증센터",
};

export default function FindIdPage() {
  return (
    <main className="auth-page">
      <div className="wrap">
        <p className="text-center text-[15px] font-extrabold text-[var(--accent)] tracking-[0.04em]">
          TY 1인 GA 파트너스
        </p>
        <h1 className="text-center text-[36px] md:text-[44px] font-extrabold tracking-[-0.04em] mt-3">
          아이디 찾기
        </h1>
        <p className="mt-3 text-center text-[var(--sub)]">본인인증 후 가입한 아이디를 안내합니다.</p>
        <div className="mt-10">
          <AccountRecoverForm mode="id" stub={partnerCertStubEnabled()} />
        </div>
      </div>
    </main>
  );
}
