"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: { zonecode: string; roadAddress: string; jibunAddress: string }) => void }) => { open: () => void };
    };
  }
}

export default function ContractInfoForm({
  name,
  phone,
  ssnFront,
  ssnMasked,
  zipCode,
  address1,
  address2,
}: {
  name: string;
  phone: string;
  ssnFront: string;
  ssnMasked: string | null;
  zipCode: string | null;
  address1: string | null;
  address2: string | null;
}) {
  const router = useRouter();
  const [ssnBack, setSsnBack] = useState("");
  const [ssnLocked, setSsnLocked] = useState(Boolean(ssnMasked));
  const [zip, setZip] = useState(zipCode || "");
  const [base, setBase] = useState(address1 || "");
  const [detail, setDetail] = useState(address2 || "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (document.getElementById("daum-postcode")) return;
    const script = document.createElement("script");
    script.id = "daum-postcode";
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    document.body.appendChild(script);
  }, []);

  function openPostcode() {
    if (!window.daum) return;
    new window.daum.Postcode({
      oncomplete(data) {
        setZip(data.zonecode);
        setBase(data.roadAddress || data.jibunAddress);
      },
    }).open();
  }

  async function onSubmit() {
    setError("");
    setPending(true);
    const res = await fetch("/api/partners/contract/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ssnBack: ssnBack.length === 7 ? ssnBack : undefined,
        zipCode: zip,
        address1: base,
        address2: detail,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "인적사항 저장에 실패했습니다.");
      if (ssnBack.length === 7) setSsnLocked(false);
      return;
    }
    setSsnBack("");
    setSsnLocked(true);
    router.push("/partners/apply/contract/bank");
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
        <label>
          성명
          <input value={name} readOnly />
        </label>
        <label>
          연락처
          <input value={phone} readOnly />
        </label>
        <label>
          주민등록번호
          <div className="contract-ssn">
            <input value={ssnFront} readOnly />
            <span>-</span>
            {ssnLocked ? (
              <>
                <input value={ssnMasked?.slice(-7) || "●●●●●●●"} readOnly />
                <button
                  type="button"
                  className="contract-ghost"
                  onClick={() => {
                    setSsnLocked(false);
                    setSsnBack("");
                  }}
                >
                  다시입력
                </button>
              </>
            ) : (
              <input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={7}
                value={ssnBack}
                onChange={(e) => setSsnBack(e.target.value.replace(/\D/g, "").slice(0, 7))}
                onBlur={() => {
                  if (ssnBack.length === 7) setSsnLocked(true);
                }}
              />
            )}
          </div>
        </label>
        <label>
          주소
          <div className="contract-addr">
            <input value={zip} readOnly placeholder="우편번호" />
            <button type="button" className="contract-ghost" onClick={openPostcode}>
              주소찾기
            </button>
          </div>
          <input value={base} readOnly placeholder="기본주소" />
          <input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="상세주소" />
        </label>
        {error ? <p className="partner-apply-alert">{error}</p> : null}
      </div>
      <div className="partner-apply-cta">
        <button type="submit" className="btn-apply" disabled={pending || (!ssnLocked && ssnBack.length !== 7) || !zip || !detail}>
          {pending ? "저장 중..." : "다음"}
        </button>
      </div>
    </form>
  );
}
