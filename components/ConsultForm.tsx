"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { digitsOnly } from "@/lib/auth";

export default function ConsultForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phone, setPhone] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, birthdate, phone, content }),
      });
      const json = (await res.json()) as { error?: string; item?: { id: string } };
      if (!res.ok) throw new Error(json.error || "상담신청에 실패했습니다.");
      router.push(`/consult/${json.item?.id || ""}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "상담신청에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form id="consult-form" className="form-card resource-admin" onSubmit={onSubmit}>
      <div className="form-grid">
        <div>
          <label htmlFor="consult-name">
            신청자 이름<span className="req">*</span>
          </label>
          <input
            id="consult-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="consult-birthdate">
            생년월일<span className="req">*</span>
          </label>
          <input
            id="consult-birthdate"
            name="birthdate"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
        </div>
        <div className="span-2">
          <label htmlFor="consult-phone">
            전화번호<span className="req">*</span>
          </label>
          <input
            id="consult-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="01012345678"
            maxLength={11}
            value={phone}
            onChange={(e) => setPhone(digitsOnly(e.target.value).slice(0, 11))}
          />
          <p className="mt-1 text-xs text-[var(--sub)]">010 번호는 11자리, - 없이 숫자만 입력해 주세요.</p>
        </div>
        <div className="span-2">
          <label htmlFor="consult-content">
            상담 내용<span className="req">*</span>
          </label>
          <textarea
            id="consult-content"
            name="content"
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상담이 필요한 내용을 적어 주세요."
          />
        </div>
        <div className="span-2">
          <p className="mt-1 text-sm text-[var(--sub)]">접수하신 전화번호로 답변드리겠습니다.</p>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-[#dc3545]">{error}</p> : null}
      <button type="submit" className="btn-apply mt-6 h-[48px] px-8" disabled={pending}>
        {pending ? "접수 중..." : "상담 신청"}
      </button>
    </form>
  );
}
