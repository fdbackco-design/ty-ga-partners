"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    const result = await login(String(data.get("username") || ""), String(data.get("password") || ""));
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/#inputcontact");
  }

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="span-2">
          <label htmlFor="username">
            아이디<span className="req">*</span>
          </label>
          <input id="username" name="username" type="text" autoComplete="username" />
        </div>
        <div className="span-2">
          <label htmlFor="password">
            비밀번호<span className="req">*</span>
          </label>
          <input id="password" name="password" type="password" autoComplete="current-password" />
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
      <button type="submit" className="btn-apply w-full mt-7 h-[56px] text-[18px]" disabled={pending}>
        {pending ? "로그인 중..." : "로그인"}
      </button>
      <p className="mt-5 text-center text-sm text-[var(--sub)]">
        아직 회원이 아니신가요?{" "}
        <Link href="/signup" className="auth-inline-link">
          회원가입
        </Link>
      </p>
    </form>
  );
}
