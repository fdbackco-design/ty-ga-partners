import "server-only";

import { classifyTyOutcome, dryRunEmployeeResponse, tyApiDryRunEnabled, type TyCallResult } from "@/lib/issue/tyResponse";
import type { EmployeePayload } from "@/lib/issue/payload";
import { logError } from "@/lib/log";

const TIMEOUT_MS = 10_000;

export function getTyApiBaseUrl() {
  return (process.env.TY_API_BASE_URL || "").replace(/\/$/, "");
}

export async function registerEmployee(payload: EmployeePayload, orgName: string): Promise<TyCallResult> {
  if (tyApiDryRunEnabled()) {
    console.info("[ty-api] DRY_RUN payload", {
      ...payload,
      empSsn1: "●●●●●●",
    });
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
  // TODO(확인필요): TY가 docURL을 등록 시점에 즉시 다운로드하는지, 나중에 조회하는지 미확인.

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
