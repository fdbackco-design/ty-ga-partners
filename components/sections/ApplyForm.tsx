"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Reveal from "../Reveal";
import PrivacyPolicyBox from "../PrivacyPolicyBox";
import { useAuth } from "@/components/AuthProvider";
import { digitsOnly } from "@/lib/auth";

const APPLY_NEXT = "/partners/apply";

export default function ApplyForm() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rrnFront, setRrnFront] = useState("");
  const [rrnBackFirst, setRrnBackFirst] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setRrnFront(user.rrnFront);
      setRrnBackFirst(user.rrnBackFirst);
      return;
    }
    setName("");
    setPhone("");
    setRrnFront("");
    setRrnBackFirst("");
  }, [user, ready]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ready || pending) return;

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(APPLY_NEXT)}`);
      return;
    }

    const data = new FormData(e.currentTarget);
    const agree = data.get("agree");

    if (!name.trim() || !phone) {
      setError("이름과 전화번호를 입력해 주세요.");
      return;
    }
    if (!/^\d{6}$/.test(rrnFront) || !/^[1-8]$/.test(rrnBackFirst)) {
      setError("주민등록번호 앞 6자리와 뒤 첫 1자리를 입력해 주세요.");
      return;
    }
    if (!agree) {
      setError("개인정보 수집 및 활용에 동의해 주세요.");
      return;
    }
    setError("");
    setPending(true);
    router.push(APPLY_NEXT);
  }

  return (
    <section id="inputcontact" className="apply-section py-[144px] md:py-[180px] bg-[#fff1ee]">
      <div className="wrap">
        <Reveal>
          <h2 className="apply-title text-center text-[36px] md:text-[48px] font-extrabold tracking-[-0.04em] text-[#ff6845]">
            TY 파트너스 등록하기
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <form className="form-card" onSubmit={onSubmit}>
            {!user && (
              <p className="mb-5 text-sm text-[var(--sub)]">
                신청하려면 로그인이 필요합니다. 회원이 아니라면 회원가입 후 본인인증과 위촉계약서 작성으로 이어집니다.
              </p>
            )}
            <div className="form-grid">
              <div>
                <label htmlFor="name">
                  이름<span className="req">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="phone">
                  전화번호<span className="req">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
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
              </div>
            </div>
            <div className="mt-6">
              <p className="font-extrabold mb-3">약관 동의</p>
              <div className="agree-row">
                <input
                  id="agree-privacy"
                  type="checkbox"
                  name="agree"
                  aria-label="개인정보 수집 및 활용 동의 (필수)"
                />
                <button
                  type="button"
                  className="privacy-toggle"
                  aria-expanded={privacyOpen}
                  aria-controls="privacy-policy-panel"
                  onClick={() => setPrivacyOpen((open) => !open)}
                >
                  <span>
                    <span className="text-[#dc3545] font-bold">(필수)</span> 개인정보 수집 및 활용 동의
                  </span>
                </button>
              </div>
              <div id="privacy-policy-panel" className="privacy-panel" hidden={!privacyOpen}>
                <PrivacyPolicyBox />
              </div>
              <p className="privacy-source">
                <a href="/privacy">개인정보 취급방침 전문 보기</a>
              </p>
              <label className="agree-row mt-4">
                <input type="checkbox" name="marketing" />
                <span>마케팅 정보 수신 동의</span>
              </label>
            </div>
            {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
            <button type="submit" className="btn-apply w-full mt-7 h-[56px] text-[18px]" disabled={!ready || pending}>
              {pending ? "이동 중..." : "리워드 2배 받고 신청하기"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
