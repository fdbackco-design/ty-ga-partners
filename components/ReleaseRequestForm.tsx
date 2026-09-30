"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import PrivacyPolicyBox from "@/components/PrivacyPolicyBox";
import { digitsOnly } from "@/lib/auth";
import { COMPANY } from "@/lib/data";

export default function ReleaseRequestForm() {
  const { user, ready, isAdmin } = useAuth();
  const member = ready && user && !isAdmin ? user : null;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  const [guestDone, setGuestDone] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    if (!member) return;
    setName((current) => current || member.name);
    setPhone((current) => current || digitsOnly(member.phone).slice(0, 11));
  }, [member]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    const memo = String(data.get("memo") || "").trim();
    const privacyAgreed = data.get("privacy") === "on";
    if (!name.trim() || !phone.trim()) {
      setError("이름과 연락처를 입력해 주세요.");
      return;
    }
    if (!privacyAgreed) {
      setError("개인정보 수집·이용에 동의해 주세요.");
      return;
    }
    setError("");
    setPending(true);
    const res = await fetch("/api/releases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, memo, privacyAgreed }),
    });
    const json = (await res.json()) as { error?: string; guest?: boolean };
    setPending(false);
    if (!res.ok) {
      setError(json.error || "신청에 실패했습니다.");
      return;
    }
    setGuestDone(Boolean(json.guest));
    setDone(true);
  }

  if (done) {
    return (
      <div className="form-card text-center">
        <p className="font-bold">정상적으로 접수되었습니다</p>
        {guestDone ? (
          <p className="mt-2 text-[var(--sub)]">남겨주신 연락처로 연락드리겠습니다.</p>
        ) : (
          <p className="mt-2 text-[var(--sub)]">
            담당자가 확인 후 연락드리겠습니다. 접수 내역은{" "}
            <Link href="/mypage" className="mypage-withdraw-link">
              마이페이지
            </Link>
            에서 확인할 수 있습니다.
          </p>
        )}
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={(e) => void onSubmit(e)}>
      <p className="mb-6 text-[var(--sub)]">
        {member
          ? `해촉 신청은 고객센터(${COMPANY.customerCenter})로 문의하시거나, 아래 정보를 남겨 주시면 안내드립니다. 접수 내역은 마이페이지에서 확인할 수 있습니다.`
          : `해촉 신청은 고객센터(${COMPANY.customerCenter})로 문의하시거나, 아래 정보를 남겨 주시면 남겨주신 연락처로 연락드리겠습니다.`}
      </p>
      <div className="form-grid">
        <div>
          <label htmlFor="release-name">
            이름<span className="req">*</span>
          </label>
          <input
            id="release-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="release-phone">
            연락처<span className="req">*</span>
          </label>
          <input
            id="release-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            placeholder="01012345678"
            autoComplete="tel"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(digitsOnly(e.target.value).slice(0, 11))}
          />
        </div>
        <div className="span-2">
          <label htmlFor="release-memo">요청 내용</label>
          <textarea id="release-memo" name="memo" rows={4} />
        </div>
      </div>
      <div className="mt-6">
        <div className="agree-row">
          <input
            id="release-privacy"
            type="checkbox"
            name="privacy"
            aria-label="개인정보 수집·이용 동의 (필수)"
          />
          <button
            type="button"
            className="privacy-toggle"
            aria-expanded={privacyOpen}
            aria-controls="release-privacy-panel"
            onClick={() => setPrivacyOpen((open) => !open)}
          >
            <span>
              <span className="text-[#dc3545] font-bold">(필수)</span> 개인정보 수집·이용 동의
            </span>
          </button>
        </div>
        <div id="release-privacy-panel" className="privacy-panel" hidden={!privacyOpen}>
          <PrivacyPolicyBox />
        </div>
        <p className="privacy-source">
          <a href="/privacy">개인정보 취급방침 전문 보기</a>
        </p>
      </div>
      {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
      <button type="submit" className="btn-apply w-full mt-7 h-[56px] text-[18px]" disabled={pending}>
        {pending ? "접수 중..." : "해촉 신청하기"}
      </button>
    </form>
  );
}
