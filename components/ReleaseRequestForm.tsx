"use client";

import { FormEvent, useState } from "react";
import { COMPANY } from "@/lib/data";

export default function ReleaseRequestForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    if (!name || !phone) {
      setError("이름과 연락처를 입력해 주세요.");
      return;
    }
    setError("");
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
    <form className="form-card" onSubmit={onSubmit}>
      <p className="mb-6 text-[var(--sub)]">
        해촉 신청은 고객센터({COMPANY.customerCenter})로 문의하시거나, 아래 정보를 남겨 주시면
        안내드립니다.
      </p>
      <div className="form-grid">
        <div>
          <label htmlFor="release-name">
            이름<span className="req">*</span>
          </label>
          <input id="release-name" name="name" type="text" />
        </div>
        <div>
          <label htmlFor="release-phone">
            연락처<span className="req">*</span>
          </label>
          <input id="release-phone" name="phone" type="tel" placeholder="010-0000-0000" />
        </div>
        <div className="span-2">
          <label htmlFor="release-memo">요청 내용</label>
          <textarea id="release-memo" name="memo" rows={4} />
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
      <button type="submit" className="btn-apply w-full mt-7 h-[56px] text-[18px]">
        해촉 신청하기
      </button>
    </form>
  );
}
