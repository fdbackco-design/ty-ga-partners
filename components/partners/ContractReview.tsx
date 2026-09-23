"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ContractPdfPreview from "@/components/partners/ContractPdfPreview";
import type { PublicContractDraft } from "@/lib/partnerApplication";

export default function ContractReview({ draft }: { draft: PublicContractDraft }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError("");
    const res = await fetch("/api/partners/contract/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "계약 체결에 실패했습니다.");
      return;
    }
    router.replace("/partners/apply/complete");
  }

  return (
    <>
      <dl className="partner-apply-id">
        <div>
          <dt>성명</dt>
          <dd>
            {draft.name} <Link href="/partners/apply/contract/info">수정</Link>
          </dd>
        </div>
        <div>
          <dt>주민등록번호</dt>
          <dd>
            {draft.ssnMasked} <Link href="/partners/apply/contract/info">수정</Link>
          </dd>
        </div>
        <div>
          <dt>주소</dt>
          <dd>
            ({draft.zipCode}) {draft.address1} {draft.address2} <Link href="/partners/apply/contract/info">수정</Link>
          </dd>
        </div>
        <div>
          <dt>정산계좌</dt>
          <dd>
            {draft.bankName} {draft.accountNoMasked} / {draft.accountHolder}{" "}
            <Link href="/partners/apply/contract/bank">수정</Link>
          </dd>
        </div>
      </dl>
      <ContractPdfPreview src="/api/partners/contract/preview" />
      <label className="contract-check is-confirm">
        <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
        위 내용으로 위촉계약을 체결합니다
      </label>
      {error ? <p className="partner-apply-alert">{error}</p> : null}
      <div className="partner-apply-cta">
        <button type="button" className="btn-apply" disabled={!confirm || pending} onClick={() => void submit()}>
          {pending ? "체결 중..." : "계약 체결하고 코드 발급"}
        </button>
      </div>
    </>
  );
}
