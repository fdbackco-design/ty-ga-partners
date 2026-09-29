import "server-only";

import { classifyTyOutcome, dryRunEmployeeResponse, tyApiDryRunEnabled, type TyCallResult } from "@/lib/issue/tyResponse";
import { auditableEmployeePayload, type EmployeePayload } from "@/lib/issue/payload";
import { isSecureTyApiBaseUrl, tyApiAllowsInsecureHttp } from "@/lib/issue/tyTransport";
import { logError } from "@/lib/log";

const TIMEOUT_MS = 10_000;

export function getTyApiBaseUrl() {
  return (process.env.TY_API_BASE_URL || "").replace(/\/$/, "");
}

export async function registerEmployee(payload: EmployeePayload, orgName: string): Promise<TyCallResult> {
  if (tyApiDryRunEnabled()) {
    console.info("[ty-api] DRY_RUN payload", auditableEmployeePayload(payload));
    return {
      ok: true,
      status: 200,
      elapsedMs: 0,
      body: dryRunEmployeeResponse({
        empName: payload.empName,
        empId: payload.empId,
        empMobile: payload.empMobile,
        orgName,
      }),
    };
  }

  const baseUrl = getTyApiBaseUrl();
  if (!baseUrl) {
    return { ok: false, kind: "network", message: "TY_API_BASE_URL이 설정되지 않았습니다.", elapsedMs: 0 };
  }
  if (!isSecureTyApiBaseUrl(baseUrl, tyApiAllowsInsecureHttp())) {
    return {
      ok: false,
      kind: "network",
      message: "주민번호를 포함한 사원등록은 HTTPS로만 전송할 수 있습니다. TY_API_BASE_URL을 https로 바꿔 주세요.",
      elapsedMs: 0,
    };
  }

  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl}/api/employee`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });
    const elapsedMs = Date.now() - started;
    let body: unknown = null;
    const raw = await res.text();
    if (raw) {
      try {
        body = JSON.parse(raw) as unknown;
      } catch {
        body = raw;
      }
    }
    if (res.status >= 500) {
      return { ok: false, kind: "http", status: res.status, message: `TY HTTP ${res.status}`, elapsedMs, body };
    }
    return { ok: true, status: res.status, body, elapsedMs };
  } catch (error) {
    const elapsedMs = Date.now() - started;
    const aborted = error instanceof Error && error.name === "AbortError";
    if (aborted) {
      return { ok: false, kind: "timeout", message: "TY API 타임아웃", elapsedMs };
    }
    logError("ty-api.employee", error);
    return {
      ok: false,
      kind: "network",
      message: error instanceof Error ? error.message : "TY API 네트워크 오류",
      elapsedMs,
    };
  } finally {
    clearTimeout(timer);
  }
}

export { classifyTyOutcome };
