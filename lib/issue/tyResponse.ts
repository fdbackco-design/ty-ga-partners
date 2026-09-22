export const DRY_RUN_EMP_CODE = "TEST000000001";

export type TyEmployeeSuccess = {
  orgName: string;
  empName: string;
  empCode: string;
  empId: string;
  empMobileNo: string;
};

export type TyCallOk = {
  ok: true;
  status: number;
  body: unknown;
  elapsedMs: number;
};

export type TyCallFail = {
  ok: false;
  kind: "timeout" | "network" | "http";
  status?: number;
  message: string;
  elapsedMs: number;
  body?: unknown;
};

export type TyCallResult = TyCallOk | TyCallFail;

export type TyOutcome =
  | { kind: "issued"; empCode: string; orgName: string; payload: unknown; raw: unknown }
  | { kind: "invalid"; code: number; message: string; raw: unknown }
  | { kind: "manual"; reason: "timeout" | "system" | "parse" | "http"; code?: number; message: string; raw?: unknown };

export function tyApiDryRunEnabled(value = process.env.TY_API_DRY_RUN) {
  return value === "true";
}

export function dryRunEmployeeResponse(input: { empName: string; empId: string; empMobile: string; orgName: string }) {
  return {
    error: { code: 0, message: "" },
    payload: {
      orgName: input.orgName,
      empName: input.empName,
      empCode: DRY_RUN_EMP_CODE,
      empId: input.empId,
      empMobileNo: input.empMobile,
    },
    data: {},
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function classifyTyOutcome(result: TyCallResult): TyOutcome {
  if (!result.ok) {
    if (result.kind === "timeout") {
      return { kind: "manual", reason: "timeout", message: result.message };
    }
    if (result.kind === "http") {
      return { kind: "manual", reason: "http", message: result.message, raw: result.body };
    }
    return { kind: "manual", reason: "system", message: result.message, raw: result.body };
  }

  const root = asRecord(result.body);
  const error = asRecord(root?.error);
  if (!root || !error || typeof error.code !== "number") {
    return { kind: "manual", reason: "parse", message: "응답 형식이 올바르지 않습니다.", raw: result.body };
  }

  if (error.code === 0) {
    const payload = asRecord(root.payload);
    const empCode = typeof payload?.empCode === "string" ? payload.empCode.trim() : "";
    if (!empCode) {
      return { kind: "manual", reason: "parse", message: "사원코드가 없습니다.", raw: result.body };
    }
    return {
      kind: "issued",
      empCode,
      orgName: typeof payload?.orgName === "string" ? payload.orgName : "",
      payload,
      raw: result.body,
    };
  }

  if (error.code === -1000) {
    return {
      kind: "invalid",
      code: -1000,
      message: typeof error.message === "string" ? error.message : "인자가 잘못되었습니다.",
      raw: result.body,
    };
  }

  if (error.code === -9999) {
    return {
      kind: "manual",
      reason: "system",
      code: -9999,
      message: typeof error.message === "string" ? error.message : "시스템 에러",
      raw: result.body,
    };
  }

  return {
    kind: "manual",
    reason: "parse",
    code: error.code,
    message: typeof error.message === "string" ? error.message : "예상하지 못한 응답입니다.",
    raw: result.body,
  };
}
