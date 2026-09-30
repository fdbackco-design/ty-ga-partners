"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Reveal from "../Reveal";
import PrivacyPolicyBox from "../PrivacyPolicyBox";
import { useAuth } from "@/components/AuthProvider";
import { digitsOnly } from "@/lib/auth";
import { contractDocHref } from "@/lib/partnerApplication";
import SystemLoginGuide from "@/components/SystemLoginGuide";
import HqChangeGuide from "@/components/HqChangeGuide";

const APPLY_NEXT = "/partners/apply";
const APPLY_VERIFY_NEXT = "/partners/apply/verify";
const APPLY_LOGIN_HREF = `/login?next=${encodeURIComponent(APPLY_VERIFY_NEXT)}`;
const APPLY_SIGNUP_HREF = `/signup?next=${encodeURIComponent(APPLY_VERIFY_NEXT)}`;

export default function ApplyForm() {
  const { user, partner, ready } = useAuth();
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

  const issued = Boolean(ready && partner?.issued);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ready || pending || !user) return;

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
            {issued ? "발급 완료" : "TY 파트너스 등록하기"}
          </h2>
        </Reveal>
        <Reveal delay={80}>
          {issued && partner ? (
            <div className="form-card issued-apply">
              <p className="issued-apply-lead">사원코드가 발급되었습니다.</p>
              <dl className="partner-apply-id">
                <div>
                  <dt>아이디</dt>
                  <dd>{partner.empId}</dd>
                </div>
                <div>
                  <dt>사원코드</dt>
                  <dd>{partner.empCode || "-"}</dd>
                </div>
              </dl>
              <SystemLoginGuide username={partner.empId} />
              <HqChangeGuide />
              {partner.docToken ? (
                <a
                  className="btn-apply w-full mt-2 h-[56px] text-[18px]"
                  href={contractDocHref(partner.docToken, "view")}
                  target="_blank"
                  rel="noreferrer"
                >
                  계약서 보기
                </a>
              ) : (
                <p className="mt-2 text-sm text-[var(--sub)]">계약서 파일이 준비되면 여기에서 확인할 수 있습니다.</p>
              )}
            </div>
          ) : !ready ? (
            <div className="form-card apply-auth-card" aria-busy="true">
              <p className="apply-auth-lead">로그인 상태를 확인하고 있습니다.</p>
            </div>
          ) : !user ? (
            <div className="form-card apply-auth-card">
              <p className="apply-auth-lead">
                코드 발급을 신청하려면 로그인이 필요합니다. 
                <br />
                회원이 아니라면 회원가입 후 본인인증으로 이어집니다.
              </p>
              <div className="apply-auth-actions">
                <Link href={APPLY_LOGIN_HREF} className="btn-apply">
                  로그인
                </Link>
                <Link href={APPLY_SIGNUP_HREF} className="apply-auth-signup">
                  회원가입
                </Link>
              </div>
            </div>
          ) : (
            <form className="form-card" onSubmit={onSubmit}>
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
          )}
        </Reveal>
      </div>
    </section>
  );
}
