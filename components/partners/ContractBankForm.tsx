"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BANKS } from "@/lib/contract/banks";
import { formatBizRegNo } from "@/lib/contract/validate";

export default function ContractBankForm({
  name,
  bankCode,
  accountNoMasked,
  accountHolder,
  bizRegNo,
}: {
  name: string;
  bankCode: string | null;
  accountNoMasked: string | null;
  accountHolder: string | null;
  bizRegNo: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(bankCode || "");
  const [accountNo, setAccountNo] = useState("");
  const [holderSelf, setHolderSelf] = useState(!accountHolder || accountHolder === name);
  const [holder, setHolder] = useState(accountHolder || name);
  const [bizOn, setBizOn] = useState(Boolean(bizRegNo));
  const [biz, setBiz] = useState(bizRegNo || "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const bank = useMemo(() => BANKS.find((item) => item.code === code) || null, [code]);

  async function onSubmit() {
    setError("");
    setPending(true);
    const res = await fetch("/api/partners/contract/bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bankCode: code,
        accountNo: accountNo || undefined,
        accountHolder: holderSelf ? name : holder,
        holderIsSelf: holderSelf,
        bizRegNo: bizOn ? biz : "",
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "계좌 정보 저장에 실패했습니다.");
      return;
    }
    router.push("/partners/apply/contract/sign");
  }

  return (
    <form
      className="contract-form"
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
    >
      <div className="contract-form-box">
        <button type="button" className="contract-bank-trigger" onClick={() => setOpen(true)}>
          {bank ? bank.name : "은행 선택"}
        </button>
        {bank ? <p className="partner-apply-hint">계좌번호 {bank.hint}</p> : null}
        <label>
          계좌번호
          <input
            inputMode="numeric"
            value={accountNo}
            placeholder={accountNoMasked || "숫자만 입력"}
            onChange={(e) => setAccountNo(e.target.value.replace(/\D/g, ""))}
          />
        </label>
        <label className="contract-check">
          <input
            type="checkbox"
            checked={holderSelf}
            onChange={(e) => {
              setHolderSelf(e.target.checked);
              if (e.target.checked) setHolder(name);
            }}
          />
          예금주는 본인 성명과 같습니다
        </label>
        {!holderSelf ? (
          <>
            <p className="partner-apply-alert">본인 명의 계좌만 등록 가능합니다</p>
            <label>
              예금주
              <input value={holder} onChange={(e) => setHolder(e.target.value)} />
            </label>
          </>
        ) : null}
        <label className="contract-check">
          <input type="checkbox" checked={bizOn} onChange={(e) => setBizOn(e.target.checked)} />
          사업자등록번호 있음
        </label>
        {bizOn ? (
          <label>
            사업자등록번호
            <input value={biz} onChange={(e) => setBiz(formatBizRegNo(e.target.value))} placeholder="000-00-00000" />
          </label>
        ) : null}
        {error ? <p className="partner-apply-alert">{error}</p> : null}
      </div>
      <div className="partner-apply-cta">
        <button type="submit" className="btn-apply" disabled={pending || !code || (accountNo.length < 8 && !accountNoMasked)}>
          {pending ? "저장 중..." : "다음"}
        </button>
      </div>
      {open ? (
        <div className="contract-sheet" role="dialog">
          <div className="contract-sheet-inner">
            <p>은행 선택</p>
            <div className="contract-bank-grid">
              {BANKS.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setCode(item.code);
                    setOpen(false);
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <button type="button" className="contract-ghost" onClick={() => setOpen(false)}>
              닫기
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
