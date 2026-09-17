"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { digitsOnly } from "@/lib/auth";
import { safeNextPath } from "@/lib/siteUrl";

export default function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [rrnFront, setRrnFront] = useState("");
  const [rrnBackFirst, setRrnBackFirst] = useState("");
  const [phone, setPhone] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    const result = await signup({
      username: String(data.get("username") || ""),
      password: String(data.get("password") || ""),
      passwordConfirm: String(data.get("passwordConfirm") || ""),
      name: String(data.get("name") || ""),
      phone,
      rrnFront,
      rrnBackFirst,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));
    router.push(next || "/#inputcontact");
  }

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="span-2">
          <label htmlFor="username">
            아이디<span className="req">*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="영문, 숫자 4~20자"
          />
        </div>
        <div>
          <label htmlFor="password">
            비밀번호<span className="req">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="8자 이상"
          />
        </div>
        <div>
          <label htmlFor="passwordConfirm">
            비밀번호 확인<span className="req">*</span>
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="name">
            이름<span className="req">*</span>
          </label>
          <input id="name" name="name" type="text" autoComplete="name" placeholder="홍길동" />
        </div>
        <div>
          <label htmlFor="phone">
            전화번호<span className="req">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="01012345678"
            value={phone}
            onChange={(e) => setPhone(digitsOnly(e.target.value).slice(0, 11))}
          />
          <p className="mt-1 text-xs text-[var(--sub)]">- 없이 숫자만 입력해주세요</p>
        </div>
        <div className="span-2">
          <label htmlFor="rrnFront">
            주민등록번호<span className="req">*</span>
          </label>
          <div className="rrn-row">
            <input
              id="rrnFront"
              name="rrnFront"
              type="text"
              inputMode="numeric"
              placeholder="앞 6자리"
              maxLength={6}
              value={rrnFront}
              onChange={(e) => setRrnFront(digitsOnly(e.target.value).slice(0, 6))}
              aria-label="주민등록번호 앞 6자리"
            />
            <span className="rrn-dash">-</span>
            <input
              id="rrnBackFirst"
              name="rrnBackFirst"
              type="text"
              inputMode="numeric"
              placeholder="0"
              maxLength={1}
              value={rrnBackFirst}
              onChange={(e) => setRrnBackFirst(digitsOnly(e.target.value).slice(0, 1))}
              aria-label="주민등록번호 뒤 첫 자리"
              className="rrn-back"
            />
            <span className="rrn-mask" aria-hidden>
              ●●●●●●
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--sub)]">앞 6자리와 뒤 첫 1자리만 입력합니다.</p>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
      <button type="submit" className="btn-apply w-full mt-7 h-[56px] text-[18px]" disabled={pending}>
        {pending ? "가입 중..." : "회원가입"}
      </button>
      <p className="mt-5 text-center text-sm text-[var(--sub)]">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="auth-inline-link">
          로그인
        </Link>
      </p>
    </form>
  );
}
