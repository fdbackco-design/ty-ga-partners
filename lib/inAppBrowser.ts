export function isInAppBrowser(ua: string) {
  return /KAKAOTALK|NAVER\(|NAVER\/|Instagram|FBAN|FBAV|FBIOS|Line\//i.test(ua);
}

export function isAndroid(ua: string) {
  return /Android/i.test(ua);
}

export function chromeIntentUrl(href: string) {
  try {
    const url = new URL(href);
    return `intent://${url.host}${url.pathname}${url.search}${url.hash}#Intent;scheme=${url.protocol.replace(":", "")};package=com.android.chrome;end`;
  } catch {
    return href;
  }
}
