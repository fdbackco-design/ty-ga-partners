"use client";

import { FormEvent, useState } from "react";
import Reveal from "../Reveal";

export default function ApplyForm() {
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const agree = data.get("agree");

    if (!name || !email || !phone) {
      setError("이름, 이메일, 전화번호를 입력해 주세요.");
      return;
    }
    if (!agree) {
      setError("개인정보 수집 및 활용에 동의해 주세요.");
      return;
    }
    setError("");
    setOk(true);
    e.currentTarget.reset();
  }

  return (
    <section id="inputcontact" className="py-[180px] md:py-[220px] bg-[#fff1ee]">
      <div className="wrap">
        <Reveal>
          <h2 className="text-center text-[36px] md:text-[48px] font-extrabold tracking-[-0.04em] text-[#ff6845]">
            TY 파트너스 등록하기
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <form className="form-card mt-10" onSubmit={onSubmit}>
            <div className="form-grid">
              <div>
                <label htmlFor="name">
                  이름<span className="req">*</span>
                </label>
                <input id="name" name="name" type="text" placeholder="홍길동" />
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
                <input id="phone" name="phone" type="text" placeholder="01012345678" />
                <p className="mt-1 text-xs text-[var(--sub)]">- 없이 숫자만 입력해주세요</p>
              </div>
              <div>
                <label htmlFor="code">인플루언서 코드</label>
                <input id="code" name="code" type="text" />
              </div>
              <div className="span-2">
                <label htmlFor="influencer">인플루언서명</label>
                <input id="influencer" name="influencer" type="text" />
              </div>
            </div>
            <div className="mt-6">
              <p className="font-extrabold mb-3">약관 동의</p>
              <label className="flex items-start gap-2 font-medium">
                <input type="checkbox" name="agree" className="mt-1" />
                <span>
                  <span className="text-[#dc3545] font-bold">(필수)</span> 개인정보 수집 및 활용 동의
                </span>
              </label>
              <label className="flex items-start gap-2 mt-2 font-medium">
                <input type="checkbox" name="marketing" className="mt-1" />
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
