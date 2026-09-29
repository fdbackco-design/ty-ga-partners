"use client";

import { FormEvent, useState } from "react";
import PrivacyPolicyBox from "@/components/PrivacyPolicyBox";
import { COMPANY } from "@/lib/data";

export default function ReleaseRequestForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const memo = String(data.get("memo") || "").trim();
    const privacyAgreed = data.get("privacy") === "on";
    if (!name || !phone) {
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
    const json = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(json.error || "신청에 실패했습니다.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="form-card text-center">
        <p className="font-bold">정상적으로 접수되었습니다</p>
        <p className="mt-2 text-[var(--sub)]">담당자가 확인 후 연락드리겠습니다.</p>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={(e) => void onSubmit(e)}>
      <p className="mb-6 text-[var(--sub)]">
        해촉 신청은 고객센터({COMPANY.customerCenter})로 문의하시거나, 아래 정보를 남겨 주시면
        안내드립니다.
      </p>
      <div className="form-grid">
        <div>
          <label htmlFor="release-name">
            이름<span className="req">*</span>
          </label>
          <input id="release-name" name="name" type="text" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="release-phone">
            연락처<span className="req">*</span>
          </label>
          <input id="release-phone" name="phone" type="tel" placeholder="010-0000-0000" autoComplete="tel" />
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
