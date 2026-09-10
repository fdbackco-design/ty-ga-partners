import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "로그인 | TY파트너스 공식인증센터",
};

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="wrap">
        <p className="text-center text-[15px] font-extrabold text-[var(--accent)] tracking-[0.04em]">
          TY 1인 GA 파트너스
        </p>
        <h1 className="text-center text-[36px] md:text-[44px] font-extrabold tracking-[-0.04em] mt-3">
          로그인
        </h1>
        <p className="mt-3 text-center text-[var(--sub)]">로그인하면 파트너스 등록 정보가 자동으로 입력됩니다.</p>
        <div className="mt-10">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
