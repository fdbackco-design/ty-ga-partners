"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateEmpId, validateEmpPassword } from "@/lib/auth";

export default function ContractAccountForm({
  empId,
  hasPassword,
  nextHref = "/partners/apply/contract/bank",
  onSaved,
  initialError = "",
}: {
  empId: string;
  hasPassword: boolean;
  nextHref?: string;
  onSaved?: () => void | Promise<void>;
  initialError?: string;
}) {
  const router = useRouter();
  const normalizeEmpId = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16);
  const [id, setId] = useState(() => normalizeEmpId(empId));
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(initialError);
  const [pending, setPending] = useState(false);

  async function onSubmit() {
    const empIdError = validateEmpId(id);
    if (empIdError) {
      setError(empIdError);
      return;
    }
    if (!hasPassword || password) {
      const passwordError = validateEmpPassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
      if (password !== passwordConfirm) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }
    setError("");
    setPending(true);
    const res = await fetch("/api/partners/contract/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empId: id.trim(),
        empPswd: password || undefined,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "전산 로그인 정보 저장에 실패했습니다.");
      return;
    }
    if (onSaved) {
      await onSaved();
      return;
    }
    router.push(nextHref);
  }

  return (
    <form
      className="contract-form"
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
    >
      <p className="partner-apply-lead">TY 전산에 로그인할 아이디와 비밀번호를 직접 정해 주세요.</p>
      <p className="partner-apply-hint">
        홈페이지 회원 아이디와 달라도 됩니다. 전산 아이디는 영문 소문자·숫자 6~16자, 비밀번호는 6자 이상입니다.
      </p>
      <div className="contract-form-box">
        <label>
          전산 아이디
          <input
            value={id}
            autoComplete="username"
            maxLength={16}
            placeholder="영문 소문자·숫자 6~16자"
            onChange={(e) => setId(normalizeEmpId(e.target.value))}
          />
        </label>
        <label>
          전산 비밀번호
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            placeholder={hasPassword ? "바꾸려면 다시 입력" : "6자 이상"}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          전산 비밀번호 확인
          <input
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            placeholder={hasPassword ? "바꾸려면 다시 입력" : "비밀번호 확인"}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </label>
        {error ? <p className="partner-apply-alert">{error}</p> : null}
      </div>
      <div className="partner-apply-cta">
        <button type="submit" className="btn-apply" disabled={pending || id.length < 6}>
          {pending ? "저장 중..." : "다음"}
        </button>
      </div>
    </form>
  );
}
