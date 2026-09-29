export function tyApiAllowsInsecureHttp(value = process.env.TY_API_ALLOW_HTTP) {
  return value === "true";
}

export function isSecureTyApiBaseUrl(baseUrl: string, allowHttp = false) {
  try {
    const url = new URL(`${baseUrl.replace(/\/$/, "")}/api/employee`);
    if (url.protocol === "https:") return true;
    if (url.protocol !== "http:") return false;
    const host = url.hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
    return allowHttp;
  } catch {
    return false;
  }
}
