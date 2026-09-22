import { Suspense } from "react";
import SignupForm from "@/components/SignupForm";

export const metadata = {
  title: "회원가입 | TY파트너스 공식인증센터",
};

export default function SignupPage() {
  return (
    <main className="auth-page">
      <div className="wrap">
        <p className="text-center text-[15px] font-extrabold text-[var(--accent)] tracking-[0.04em]">
          TY 1인 GA 파트너스
        </p>
        <h1 className="text-center text-[36px] md:text-[44px] font-extrabold tracking-[-0.04em] mt-3">
          회원가입
        </h1>
        <p className="mt-3 text-center text-[var(--sub)]">아이디와 기본 정보를 등록하고 파트너스 신청을 이어가세요.</p>
        <div className="mt-10">
          <Suspense>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

export const metadata = {
  title: "회원가입 | TY파트너스 공식인증센터",
};

export default function SignupPage() {
  return (
    <main className="auth-page">
      <div className="wrap">
        <p className="text-center text-[15px] font-extrabold text-[var(--accent)] tracking-[0.04em]">
          TY 1인 GA 파트너스
        </p>
        <h1 className="text-center text-[36px] md:text-[44px] font-extrabold tracking-[-0.04em] mt-3">
          회원가입
        </h1>
        <p className="mt-3 text-center text-[var(--sub)]">아이디와 기본 정보를 등록하고 파트너스 신청을 이어가세요.</p>
        <div className="mt-10">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
