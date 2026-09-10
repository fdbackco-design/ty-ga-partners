"use client";

import { FormEvent, useEffect, useState } from "react";
import Reveal from "../Reveal";
import PrivacyPolicyBox from "../PrivacyPolicyBox";
import { useAuth } from "@/components/AuthProvider";
import { digitsOnly } from "@/lib/auth";

export default function ApplyForm() {
  const { user, ready } = useAuth();
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
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
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "").trim();
    const agree = data.get("agree");

    if (!name.trim() || !email || !phone) {
      setError("이름, 이메일, 전화번호를 입력해 주세요.");
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
    setOk(true);
    e.currentTarget.reset();
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setRrnFront(user.rrnFront);
      setRrnBackFirst(user.rrnBackFirst);
    } else {
      setName("");
      setPhone("");
      setRrnFront("");
      setRrnBackFirst("");
    }
  }

  return (
    <section id="inputcontact" className="py-[144px] md:py-[180px] bg-[#fff1ee]">
      <div className="wrap">
        <Reveal>
          <h2 className="text-center text-[36px] md:text-[48px] font-extrabold tracking-[-0.04em] text-[#ff6845]">
            TY 파트너스 등록하기
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <form className="form-card mt-10" onSubmit={onSubmit}>
            {user ? (
              <p className="mb-5 text-sm text-[var(--sub)]">
                로그인 정보로 이름, 전화번호, 주민등록번호가 자동 입력되었습니다.
              </p>
            ) : null}
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
                <label htmlFor="email">
                  이메일<span className="req">*</span>
                </label>
                <input id="email" name="email" type="text" placeholder="example@naver.com" />
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
              <div>
                <label htmlFor="code">인플루언서 코드</label>
                <input id="code" name="code" type="text" />
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
              <div className="span-2">
                <label htmlFor="influencer">인플루언서명</label>
                <input id="influencer" name="influencer" type="text" />
              </div>
            </div>
            <div className="mt-6">
              <p className="font-extrabold mb-3">약관 동의</p>
              <label className="agree-row">
                <input type="checkbox" name="agree" />
                <span>
                  <span className="text-[#dc3545] font-bold">(필수)</span> 개인정보 수집 및 활용 동의
                </span>
              </label>
              <PrivacyPolicyBox />
              <p className="privacy-source">
                <a href="/privacy">개인정보 취급방침 전문 보기</a>
              </p>
              <label className="agree-row mt-4">
                <input type="checkbox" name="marketing" />
                <span>마케팅 정보 수신 동의</span>
              </label>
            </div>
            {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
            <button type="submit" className="btn-apply w-full mt-7 h-[56px] text-[18px]">
              리워드 2배 받고 신청하기
            </button>
          </form>
        </Reveal>
      </div>

      {ok ? (
        <div className="modal" onClick={() => setOk(false)}>
          <div className="bg-white rounded-2xl px-10 py-8 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold">정상적으로 접수되었습니다</p>
            <button type="button" className="btn-apply mt-6" onClick={() => setOk(false)}>
              확인
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
