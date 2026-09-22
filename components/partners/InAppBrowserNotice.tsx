"use client";

import { chromeIntentUrl, isAndroid } from "@/lib/inAppBrowser";

export default function InAppBrowserNotice({ href }: { href: string }) {
  const android = typeof navigator !== "undefined" && isAndroid(navigator.userAgent);

  return (
    <div className="partner-apply-notice" role="alert">
      <p className="partner-apply-notice-title">Chrome 또는 Safari에서 열어 주세요</p>
      <p>
        카카오톡·네이버 등 인앱 브라우저에서는 본인인증 결과가 전달되지 않을 수 있습니다. 주소창의 메뉴에서 외부
        브라우저로 연 뒤 다시 시도해 주세요.
      </p>
      {android ? (
        <a className="partner-apply-link" href={chromeIntentUrl(href)}>
          Chrome으로 열기
        </a>
      ) : null}
    </div>
  );
}
