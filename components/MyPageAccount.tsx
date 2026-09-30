"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useId, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { digitsOnly, formatPhoneDisplay } from "@/lib/auth";
import { formatKstDateTime } from "@/lib/formatDate";
import { contractDocHref, type MemberPartnerSummary } from "@/lib/partnerApplication";
import { releaseStatusLabel, type ReleaseRequest } from "@/lib/releases";
import type { PhoneHistoryItem } from "@/lib/usersStore";
import SystemLoginGuide from "@/components/SystemLoginGuide";
import HqChangeGuide from "@/components/HqChangeGuide";

type AccountUser = {
  username: string;
  name: string;
  phone: string;
};

const TABS = [
  { id: "phone", label: "휴대폰 번호 변경" },
  { id: "password", label: "비밀번호 변경" },
  { id: "withdraw", label: "회원탈퇴" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function MyPageAccount({
  username,
  name,
  phone,
  phoneLocked,
  withdrawLocked,
  partner,
  phoneHistory,
  releases,
}: {
  username: string;
  name: string;
  phone: string;
  phoneLocked: boolean;
  withdrawLocked: boolean;
  partner: MemberPartnerSummary;
  phoneHistory: PhoneHistoryItem[];
  releases: ReleaseRequest[];
}) {
  const { logout, refreshMember } = useAuth();
  const tabPrefix = useId();
  const [tab, setTab] = useState<TabId>("phone");
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
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [withdrawAgreed, setWithdrawAgreed] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawPending, setWithdrawPending] = useState(false);

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

  async function onWithdrawSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (withdrawLocked || withdrawPending) return;
    setWithdrawError("");
    if (!withdrawPassword) {
      setWithdrawError("현재 비밀번호를 입력해 주세요.");
      return;
    }
    if (!withdrawAgreed) {
      setWithdrawError("회원탈퇴에 동의해 주세요.");
      return;
    }
    if (!confirm("회원탈퇴를 진행할까요? 계정 정보는 삭제되며 되돌릴 수 없습니다.")) return;
    setWithdrawPending(true);
    try {
      const res = await fetch("/api/member/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: withdrawPassword, confirmed: true }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setWithdrawError(data.error || "회원탈퇴에 실패했습니다.");
        return;
      }
      logout();
      window.location.assign("/");
    } catch {
      setWithdrawError("회원탈퇴에 실패했습니다.");
    } finally {
      setWithdrawPending(false);
    }
  }

  function onTabKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const index = TABS.findIndex((item) => item.id === tab);
    if (index < 0) return;
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    setTab(TABS[next].id);
    document.getElementById(`${tabPrefix}-${TABS[next].id}`)?.focus();
  }

  return (
    <div className="mypage-stack">
      <section className="form-card">
        <h2 className="mypage-section-title">사원 등록</h2>
        <dl className="partner-apply-id">
          <div>
            <dt>신청 상태</dt>
            <dd>{partner.statusLabel}</dd>
          </div>
          <div>
            <dt>사원코드</dt>
            <dd>{partner.empCode || "-"}</dd>
          </div>
        </dl>
        {partner.docToken ? (
          <a className="btn-apply w-full mt-7 h-[56px] text-[18px]" href={contractDocHref(partner.docToken)}>
            계약서 다운로드
          </a>
        ) : (
          <p className="mt-5 text-sm text-[var(--sub)]"></p>
        )}
        <HqChangeGuide />
      </section>

      <section className="form-card">
        <h2 className="mypage-section-title">해촉 신청</h2>
        {releases.length === 0 ? (
          <p className="text-sm text-[var(--sub)]">
            접수된 해촉 신청이 없습니다.{" "}
            <Link href="/release-request" className="mypage-withdraw-link">
              해촉 신청
            </Link>
            에서 접수할 수 있습니다.
          </p>
        ) : (
          <ul className="mypage-release-list">
            {releases.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{releaseStatusLabel(item.status)}</strong>
                  <span>{formatPhoneDisplay(item.phone)}</span>
                </div>
                <p>{item.memo || "요청 내용 없음"}</p>
                <time dateTime={item.createdAt}>{formatKstDateTime(item.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>

      {partner.issued ? (
        <section className="form-card">
          <SystemLoginGuide username={username} plain />
        </section>
      ) : null}

      <div className="mypage-tabs" role="tablist" aria-label="마이페이지 메뉴" onKeyDown={onTabKeyDown}>
        {TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              id={`${tabPrefix}-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${tabPrefix}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              className={selected ? "is-on" : ""}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "phone" ? (
      <form
        className="form-card"
        id={`${tabPrefix}-panel-phone`}
        role="tabpanel"
        aria-labelledby={`${tabPrefix}-phone`}
        onSubmit={(e) => void onPhoneSubmit(e)}
      >
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
        <h2 className="mypage-section-title mypage-section-title-follow">휴대폰 번호 변경</h2>
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
      ) : null}

      {tab === "password" ? (
      <form
        className="form-card"
        id={`${tabPrefix}-panel-password`}
        role="tabpanel"
        aria-labelledby={`${tabPrefix}-password`}
        onSubmit={(e) => void onPasswordSubmit(e)}
      >
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
      ) : null}

      {tab === "withdraw" ? (
      <form
        className="form-card mypage-withdraw"
        id={`${tabPrefix}-panel-withdraw`}
        role="tabpanel"
        aria-labelledby={`${tabPrefix}-withdraw`}
        onSubmit={(e) => void onWithdrawSubmit(e)}
      >
        <h2 className="mypage-section-title">회원탈퇴</h2>
        {withdrawLocked ? (
          <>
            <p className="partner-apply-hint">
              위촉계약이 체결되었거나 사원코드가 발급된 계정은 마이페이지에서 탈퇴할 수 없습니다.
            </p>
            <p className="mt-3 text-sm text-[var(--sub)]">
              해촉이 필요하시면{" "}
              <Link href="/release-request" className="mypage-withdraw-link">
                해촉 신청
              </Link>
              을 이용해 주세요.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--sub)]">
              탈퇴하면 계정과 가입 정보가 삭제되며 복구할 수 없습니다. 본인 확인을 위해 현재 비밀번호를 입력해 주세요.
            </p>
            <div className="form-grid mt-5">
              <div className="span-2">
                <label htmlFor="withdrawPassword">현재 비밀번호</label>
                <input
                  id="withdrawPassword"
                  type="password"
                  autoComplete="current-password"
                  value={withdrawPassword}
                  disabled={withdrawPending}
                  onChange={(e) => setWithdrawPassword(e.target.value)}
                />
              </div>
            </div>
            <label className="agree-row mt-5">
              <input
                type="checkbox"
                checked={withdrawAgreed}
                disabled={withdrawPending}
                onChange={(e) => setWithdrawAgreed(e.target.checked)}
              />
              <span>위 내용을 확인했으며 회원탈퇴에 동의합니다.</span>
            </label>
            {withdrawError ? <p className="mt-4 text-sm text-[#dc3545]">{withdrawError}</p> : null}
            <button type="submit" className="btn-withdraw w-full mt-7 h-[56px] text-[18px]" disabled={withdrawPending}>
              {withdrawPending ? "탈퇴 중..." : "회원탈퇴"}
            </button>
          </>
        )}
      </form>
      ) : null}
    </div>
  );
}
