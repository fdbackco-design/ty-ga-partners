"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import InAppBrowserNotice from "@/components/partners/InAppBrowserNotice";
import { useNiceCert } from "@/hooks/useNiceCert";
import { formatSsn, stubSsnBack } from "@/lib/contract/validate";
import { isInAppBrowser } from "@/lib/inAppBrowser";
import { digitsOnly } from "@/lib/partnerCert";

type RecoverAccount = {
  id: string;
  usernameMasked: string;
};

type IdentityResponse = {
  ok?: boolean;
  error?: string;
  accounts?: RecoverAccount[];
  token?: string;
};

export default function AccountRecoverForm({
  mode,
  stub = false,
}: {
  mode: "id" | "password";
  stub?: boolean;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [accounts, setAccounts] = useState<RecoverAccount[] | null>(null);
  const [token, setToken] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [resetDone, setResetDone] = useState(false);

  async function submitIdentity(body: unknown) {
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/member/recover/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as IdentityResponse;
      if (!res.ok) {
        setError(data.error || "본인인증 검증에 실패했습니다.");
        return false;
      }
      const nextAccounts = data.accounts || [];
      setAccounts(nextAccounts);
      setToken(data.token || "");
      setSelectedId(nextAccounts[0]?.id || "");
      return true;
    } catch {
      setError("본인인증 검증에 실패했습니다.");
      return false;
    } finally {
      setPending(false);
    }
  }

  async function onReset(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/member/recover/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          userId: selectedId,
          password,
          passwordConfirm,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "비밀번호 변경에 실패했습니다.");
        return;
      }
      setResetDone(true);
    } catch {
      setError("비밀번호 변경에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  if (resetDone) {
    return (
      <div className="form-card">
        <p className="text-center text-[17px] font-extrabold tracking-[-0.03em]">비밀번호가 변경되었습니다.</p>
        <p className="mt-2 text-center text-sm text-[var(--sub)]">새 비밀번호로 로그인해 주세요.</p>
        <Link href="/login" className="btn-apply w-full mt-7 h-[56px] text-[18px] inline-flex items-center justify-center">
          로그인하기
        </Link>
      </div>
    );
  }

  if (accounts) {
    if (mode === "id") {
      return (
        <div className="form-card">
          <p className="text-center text-sm text-[var(--sub)]">본인인증으로 확인된 아이디입니다.</p>
          <ul className="auth-found-ids">
            {accounts.map((account) => (
              <li key={account.id}>{account.usernameMasked}</li>
            ))}
          </ul>
          <Link href="/login" className="btn-apply w-full mt-7 h-[56px] text-[18px] inline-flex items-center justify-center">
            로그인하기
          </Link>
          <RecoverFooter mode={mode} />
        </div>
      );
    }

    return (
      <form className="form-card" onSubmit={onReset}>
        {accounts.length > 1 ? (
          <fieldset className="auth-account-list">
            <legend>비밀번호를 바꿀 아이디</legend>
            {accounts.map((account) => (
              <label key={account.id} className="auth-account-option">
                <input
                  type="radio"
                  name="recoverUser"
                  value={account.id}
                  checked={selectedId === account.id}
                  onChange={() => setSelectedId(account.id)}
                />
                <span>{account.usernameMasked}</span>
              </label>
            ))}
          </fieldset>
        ) : (
          <>
            <p className="text-center text-sm text-[var(--sub)]">본인인증으로 확인된 아이디입니다.</p>
            <p className="auth-found-id">{accounts[0]?.usernameMasked}</p>
          </>
        )}
        <div className="form-grid mt-5">
          <div className="span-2">
            <label htmlFor="recover-password">새 비밀번호</label>
            <input
              id="recover-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="span-2">
            <label htmlFor="recover-password-confirm">새 비밀번호 확인</label>
            <input
              id="recover-password-confirm"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
        <button type="submit" className="btn-apply w-full mt-7 h-[56px] text-[18px]" disabled={pending}>
          {pending ? "변경 중..." : "비밀번호 변경"}
        </button>
        <RecoverFooter mode={mode} />
      </form>
    );
  }

  if (stub) {
    return (
      <AccountRecoverStub
        mode={mode}
        error={error}
        pending={pending}
        onSubmit={(body) => void submitIdentity(body)}
      />
    );
  }

  return (
    <AccountRecoverNice
      mode={mode}
      error={error}
      pending={pending}
      onResult={(payload) => void submitIdentity({ ...(payload as object), purpose: mode })}
    />
  );
}

function AccountRecoverStub({
  mode,
  error,
  pending,
  onSubmit,
}: {
  mode: "id" | "password";
  error: string;
  pending: boolean;
  onSubmit: (body: unknown) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ssn, setSsn] = useState("");

  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ stub: true, purpose: mode, name, phone, ssn });
      }}
    >
      <p className="partner-cert-stub-note">
        NICE 본인인증을 건너뛰는 임시 테스트 화면입니다. 사원 등록과 같은 이름·휴대폰·주민번호로 가입 아이디를 찾습니다.
        운영 배포에서는 켜지지 않습니다.
      </p>
      <div className="partner-cert-stub-form">
        <label>
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label>
          휴대폰
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            autoComplete="tel"
          />
        </label>
        <label>
          주민등록번호
          <input
            value={ssn}
            onChange={(e) => setSsn(formatSsn(e.target.value))}
            inputMode="numeric"
            autoComplete="off"
          />
        </label>
        <div className="partner-cert-stub-tools">
          <button
            type="button"
            className="contract-ghost"
            onClick={() => {
              const digits = digitsOnly(ssn);
              const front = digits.slice(0, 6);
              const gender = digits.slice(6, 7) || "1";
              const back = stubSsnBack(front, gender);
              if (back) setSsn(formatSsn(`${front}${back}`));
            }}
          >
            체크섬 맞는 번호 채우기
          </button>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
      <button type="submit" className="btn-apply w-full mt-7 h-[56px] text-[18px]" disabled={pending}>
        {pending ? "확인 중..." : mode === "id" ? "테스트 정보로 아이디 찾기" : "테스트 정보로 비밀번호 찾기"}
      </button>
      <RecoverFooter mode={mode} />
    </form>
  );
}

function AccountRecoverNice({
  mode,
  error,
  pending,
  onResult,
}: {
  mode: "id" | "password";
  error: string;
  pending: boolean;
  onResult: (payload: unknown) => void;
}) {
  const inApp = useMemo(() => (typeof navigator === "undefined" ? false : isInAppBrowser(navigator.userAgent)), []);
  const pageHref = typeof window === "undefined" ? "" : window.location.href;
  const { status, start, setStatus } = useNiceCert(async (payload) => {
    setStatus("idle");
    onResult(payload);
  });

  const certPending = status === "pending" || pending;
  const retryable = status === "cancelled" || status === "timeout" || status === "blocked" || Boolean(error);
  const showInApp = inApp || status === "inapp-stale";

  return (
    <div className="form-card">
      {showInApp ? <InAppBrowserNotice href={pageHref} /> : null}
      {status === "pending" ? <p className="mt-4 text-sm font-bold text-[var(--gold)]">인증창에서 진행해 주세요.</p> : null}
      {status === "blocked" ? (
        <p className="mt-4 text-sm text-[#dc3545]">주소창 오른쪽 팝업 차단 아이콘을 눌러 허용한 뒤 다시 시도해 주세요.</p>
      ) : null}
      {status === "cancelled" ? <p className="mt-4 text-sm text-[#dc3545]">인증이 완료되지 않았습니다.</p> : null}
      {status === "timeout" ? (
        <p className="mt-4 text-sm text-[#dc3545]">인증 시간이 초과되었습니다. 다시 인증해 주세요.</p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
      <button
        type="button"
        className="btn-apply w-full mt-7 h-[56px] text-[18px]"
        onClick={() => start()}
        disabled={certPending}
      >
        {certPending
          ? status === "pending"
            ? "인증 진행 중..."
            : "확인 중..."
          : retryable
            ? "다시 인증하기"
            : "휴대폰으로 본인인증"}
      </button>
      <RecoverFooter mode={mode} />
    </div>
  );
}

function RecoverFooter({ mode }: { mode: "id" | "password" }) {
  return (
    <p className="auth-recover-links">
      <Link href="/login" className="auth-inline-link">
        로그인
      </Link>
      <span className="sep" aria-hidden="true">
        |
      </span>
      {mode === "id" ? (
        <Link href="/login/find-password" className="auth-inline-link">
          비밀번호 찾기
        </Link>
      ) : (
        <Link href="/login/find-id" className="auth-inline-link">
          아이디 찾기
        </Link>
      )}
    </p>
  );
}
