"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import InAppBrowserNotice from "@/components/partners/InAppBrowserNotice";
import PartnerApplyShell from "@/components/partners/PartnerApplyShell";
import { useNiceCert } from "@/hooks/useNiceCert";
import { formatSsn, stubSsnBack } from "@/lib/contract/validate";
import { digitsOnly } from "@/lib/partnerCert";
import { isInAppBrowser } from "@/lib/inAppBrowser";

type StubDefaults = {
  name: string;
  phone: string;
  ssnFront: string;
  ssnBackFirst: string;
};

export default function VerifyCert({
  maskedName,
  maskedPhone,
  recert = false,
  stub = false,
  stubDefaults,
}: {
  maskedName: string;
  maskedPhone: string;
  recert?: boolean;
  stub?: boolean;
  stubDefaults?: StubDefaults;
}) {
  if (stub && stubDefaults) {
    return <VerifyCertStub recert={recert} defaults={stubDefaults} />;
  }
  return <VerifyCertNice maskedName={maskedName} maskedPhone={maskedPhone} recert={recert} />;
}

function VerifyCertStub({ recert, defaults }: { recert: boolean; defaults: StubDefaults }) {
  const router = useRouter();
  const [name, setName] = useState(defaults.name);
  const [phone, setPhone] = useState(defaults.phone);
  const [ssn, setSsn] = useState(() => {
    const back = stubSsnBack(defaults.ssnFront, defaults.ssnBackFirst);
    return back ? formatSsn(`${defaults.ssnFront}${back}`) : defaults.ssnFront;
  });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function fillValidSsn() {
    const digits = digitsOnly(ssn);
    const front = digits.slice(0, 6) || defaults.ssnFront;
    const gender = digits.slice(6, 7) || defaults.ssnBackFirst;
    const back = stubSsnBack(front, gender);
    if (back) setSsn(formatSsn(`${front}${back}`));
  }

  async function onSubmit() {
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/partners/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stub: true, name, phone, ssn }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "테스트 본인인증에 실패했습니다.");
        return;
      }
      router.replace("/partners/apply/contract");
    } catch {
      setError("테스트 본인인증에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PartnerApplyShell step={1} title="본인인증" backHref="/partners/apply">
      <p className="partner-apply-lead">
        {recert
          ? "본인인증 유효 시간이 지나 다시 인증이 필요합니다. 테스트 정보를 다시 넣어 주세요."
          : "테스트 서버용으로 이름, 휴대폰, 주민등록번호를 직접 넣을 수 있습니다."}
      </p>
      <p className="partner-cert-stub-note">
        NICE 본인인증을 건너뛰는 임시 테스트 화면입니다. 사원등록 API에는 여기 입력한 이름·휴대폰·주민번호 앞자리가
        전달됩니다. 운영 배포에서는 켜지지 않습니다.
      </p>
      <form
        className="partner-cert-stub-form"
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
      >
        <label>
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label>
          휴대폰
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            autoComplete="tel"
          />
        </label>
        <label>
          주민등록번호
          <input
            value={ssn}
            onChange={(e) => setSsn(formatSsn(e.target.value))}
            inputMode="numeric"
            autoComplete="off"
          />
        </label>
        <div className="partner-cert-stub-tools">
          <button type="button" className="contract-ghost" onClick={fillValidSsn}>
            체크섬 맞는 번호 채우기
          </button>
        </div>
        {error ? <p className="partner-apply-alert">{error}</p> : null}
        <div className="partner-apply-cta">
          <button type="submit" className="btn-apply" disabled={pending}>
            {pending ? "저장 중..." : recert ? "테스트 정보로 다시 인증" : "테스트 정보로 진행"}
          </button>
        </div>
      </form>
    </PartnerApplyShell>
  );
}

function VerifyCertNice({
  maskedName,
  maskedPhone,
  recert,
}: {
  maskedName: string;
  maskedPhone: string;
  recert: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inApp = useMemo(() => (typeof navigator === "undefined" ? false : isInAppBrowser(navigator.userAgent)), []);
  const pageHref = typeof window === "undefined" ? "/partners/apply/verify" : window.location.href;

  const { status, start, setStatus, cleanup } = useNiceCert(async (payload) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/partners/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("idle");
        setError(data.error || "본인인증 검증에 실패했습니다.");
        return;
      }
      router.replace("/partners/apply/contract");
    } catch {
      setStatus("idle");
      setError("본인인증 검증에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  });

  async function onClick() {
    setError("");
    const opened = start();
    if (!opened) return;
    try {
      const res = await fetch("/api/partners/cert/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "CERT_OPENED" }),
      });
      if (res.status === 429) {
        cleanup(true);
        const data = (await res.json()) as { error?: string };
        setError(data.error || "인증 시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.");
        setStatus("idle");
      }
    } catch {
      // 팝업은 이미 열렸으므로 로그만 실패해도 인증은 계속합니다.
    }
  }

  const timeoutLogged = useRef(false);
  useEffect(() => {
    if (status !== "timeout" || timeoutLogged.current) return;
    timeoutLogged.current = true;
    void fetch("/api/partners/cert/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "CERT_TIMEOUT" }),
    }).catch(() => undefined);
  }, [status]);

  useEffect(() => {
    if (status !== "timeout") timeoutLogged.current = false;
  }, [status]);

  const pending = status === "pending" || submitting;
  const retryable = status === "cancelled" || status === "timeout" || status === "blocked" || Boolean(error);
  const showInApp = inApp || status === "inapp-stale";

  return (
    <PartnerApplyShell step={1} title="본인인증" backHref="/partners/apply">
      {showInApp ? <InAppBrowserNotice href={pageHref} /> : null}
      <p className="partner-apply-lead">
        {recert
          ? "본인인증 유효 시간이 지나 다시 인증이 필요합니다. 인증이 끝나면 계약서 작성으로 이동합니다."
          : "가입하신 정보와 휴대폰 명의가 같은지 확인합니다."}
      </p>
      <dl className="partner-apply-id">
        <div>
          <dt>이름</dt>
          <dd>{maskedName}</dd>
        </div>
        <div>
          <dt>휴대폰</dt>
          <dd>{maskedPhone}</dd>
        </div>
      </dl>
      {status === "pending" ? <p className="partner-apply-hint">인증창에서 진행해 주세요.</p> : null}
      {status === "blocked" ? (
        <p className="partner-apply-alert">주소창 오른쪽 팝업 차단 아이콘을 눌러 허용한 뒤 다시 시도해 주세요.</p>
      ) : null}
      {status === "cancelled" ? (
        <p className="partner-apply-alert">인증이 완료되지 않았습니다.</p>
      ) : null}
      {status === "timeout" ? (
        <p className="partner-apply-alert">인증 시간이 초과되었습니다. 다시 인증해 주세요.</p>
      ) : null}
      {error ? <p className="partner-apply-alert">{error}</p> : null}
      <div className="partner-apply-cta">
        <button type="button" className="btn-apply" onClick={onClick} disabled={pending}>
          {pending ? "인증 진행 중..." : recert || retryable ? "다시 인증하기" : "휴대폰으로 본인인증"}
        </button>
      </div>
    </PartnerApplyShell>
  );
}
