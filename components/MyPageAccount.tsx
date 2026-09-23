"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { digitsOnly, formatPhoneDisplay } from "@/lib/auth";
import { formatKstDateTime } from "@/lib/formatDate";
import type { PhoneHistoryItem } from "@/lib/usersStore";

type AccountUser = {
  username: string;
  name: string;
  phone: string;
};

export default function MyPageAccount({
  username,
  name,
  phone,
  phoneLocked,
  phoneHistory,
}: {
  username: string;
  name: string;
  phone: string;
  phoneLocked: boolean;
  phoneHistory: PhoneHistoryItem[];
}) {
  const { refreshMember } = useAuth();
  const [currentPhone, setCurrentPhone] = useState(phone);
  const [history, setHistory] = useState(phoneHistory);
  const [locked, setLocked] = useState(phoneLocked);
  const [nextPhone, setNextPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneOk, setPhoneOk] = useState("");
  const [phonePending, setPhonePending] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordOk, setPasswordOk] = useState("");
  const [passwordPending, setPasswordPending] = useState(false);

  async function onPhoneSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPhoneError("");
    setPhoneOk("");
    setPhonePending(true);
    try {
      const res = await fetch("/api/member/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: nextPhone }),
      });
      const data = (await res.json()) as {
        error?: string;
        user?: AccountUser;
        phoneLocked?: boolean;
        phoneHistory?: PhoneHistoryItem[];
      };
      if (!res.ok || !data.user) {
        setPhoneError(data.error || "휴대폰 번호를 바꾸지 못했습니다.");
        return;
      }
      setCurrentPhone(data.user.phone);
      setHistory(data.phoneHistory || []);
      setLocked(Boolean(data.phoneLocked));
      setNextPhone("");
      setPhoneOk("휴대폰 번호를 바꿨습니다. 본인인증은 새 번호로 진행해 주세요.");
      await refreshMember();
    } catch {
      setPhoneError("휴대폰 번호를 바꾸지 못했습니다.");
    } finally {
      setPhonePending(false);
    }
  }

  async function onPasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError("");
    setPasswordOk("");
    setPasswordPending(true);
    try {
      const res = await fetch("/api/member/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, password, passwordConfirm }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setPasswordError(data.error || "비밀번호를 바꾸지 못했습니다.");
        return;
      }
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirm("");
      setPasswordOk("비밀번호를 바꿨습니다.");
    } catch {
      setPasswordError("비밀번호를 바꾸지 못했습니다.");
    } finally {
      setPasswordPending(false);
    }
  }

  return (
    <div className="mypage-stack">
      <section className="form-card">
        <h2 className="mypage-section-title">기본 정보</h2>
        <dl className="partner-apply-id">
          <div>
            <dt>아이디</dt>
            <dd>{username}</dd>
          </div>
          <div>
            <dt>이름</dt>
            <dd>{name}</dd>
          </div>
          <div>
            <dt>휴대폰</dt>
            <dd>{formatPhoneDisplay(currentPhone)}</dd>
          </div>
        </dl>
      </section>

      <form className="form-card" onSubmit={(e) => void onPhoneSubmit(e)}>
        <h2 className="mypage-section-title">휴대폰 번호 변경</h2>
        {locked ? (
          <p className="partner-apply-hint">사원코드가 발급된 뒤에는 휴대폰 번호를 바꿀 수 없습니다.</p>
        ) : (
          <p className="text-sm text-[var(--sub)]">
            바꾼 번호는 사원 등록 전 본인인증에 사용됩니다. 이전 번호는 아래에 기록됩니다.
          </p>
        )}
        <div className="form-grid mt-5">
          <div className="span-2">
            <label htmlFor="nextPhone">새 휴대폰 번호</label>
            <input
              id="nextPhone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="01012345678"
              value={nextPhone}
              disabled={locked || phonePending}
              onChange={(e) => setNextPhone(digitsOnly(e.target.value).slice(0, 11))}
            />
          </div>
        </div>
        {phoneError ? <p className="mt-4 text-sm text-[#dc3545]">{phoneError}</p> : null}
        {phoneOk ? <p className="mt-4 text-sm text-[var(--gold)]">{phoneOk}</p> : null}
        <button type="submit" className="btn-apply w-full mt-7 h-[56px] text-[18px]" disabled={locked || phonePending}>
          {phonePending ? "변경 중..." : "휴대폰 번호 변경"}
        </button>
        {history.length ? (
          <div className="mypage-history">
            <h3>이전 휴대폰 번호</h3>
            <ul>
              {history.map((item) => (
                <li key={`${item.phone}-${item.changedAt}`}>
                  <span>{formatPhoneDisplay(item.phone)}</span>
                  <time>{formatKstDateTime(item.changedAt)}</time>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </form>

      <form className="form-card" onSubmit={(e) => void onPasswordSubmit(e)}>
        <h2 className="mypage-section-title">비밀번호 변경</h2>
        <div className="form-grid mt-5">
          <div className="span-2">
            <label htmlFor="currentPassword">현재 비밀번호</label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="8자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newPasswordConfirm">새 비밀번호 확인</label>
            <input
              id="newPasswordConfirm"
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
        </div>
        {passwordError ? <p className="mt-4 text-sm text-[#dc3545]">{passwordError}</p> : null}
        {passwordOk ? <p className="mt-4 text-sm text-[var(--gold)]">{passwordOk}</p> : null}
        <button type="submit" className="btn-apply w-full mt-7 h-[56px] text-[18px]" disabled={passwordPending}>
          {passwordPending ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </div>
  );
}
