import { CHANNELS } from "@/config/channels";
import {
  auditableEmployeePayload,
  issueIdempotencyKey,
  validateIssueFields,
} from "@/lib/issue/payload";
import { classifyTyOutcome, type TyCallResult } from "@/lib/issue/tyResponse";
import { notifyAdminAlert } from "@/lib/server/adminAlert";
import { registerEmployee } from "@/lib/server/ty-api";
import {
  claimSubmitting,
  getApplicationByUserId,
  getIssuedApplicationByEmpId,
  patchApplication,
  writeAuditLog,
} from "@/lib/partnerApplicationsStore";
import type { PartnerApplication, PartnerApplicationStatus } from "@/lib/partnerApplication";
import type { StoredUser } from "@/lib/usersStore";

export type IssueActor = {
  kind: "user" | "admin";
  id: string;
  ip?: string | null;
  userAgent?: string | null;
};

export type IssueRunResult =
  | { ok: true; status: "ISSUED"; empCode: string; already: boolean }
  | { ok: false; http: number; error: string; status?: PartnerApplicationStatus };

function channelOrgName(application: PartnerApplication) {
  const channel = Object.values(CHANNELS).find((item) => item.orgCode === application.orgCode);
  return application.orgName || channel?.label || application.joinChannel;
}

export async function runEmployeeIssue(input: {
  user: StoredUser;
  application: PartnerApplication;
  actor: IssueActor;
}): Promise<IssueRunResult> {
  const { user, actor } = input;
  let application = input.application;

  await writeAuditLog({
    applicationId: application.id,
    userId: user.id,
    event: "ISSUE_REQUESTED",
    meta: { actor: actor.kind },
    ip: actor.ip,
    userAgent: actor.userAgent,
  });

  if (application.status === "ISSUED") {
    return { ok: true, status: "ISSUED", empCode: application.empCode || "", already: true };
  }
  if (application.status === "NEEDS_MANUAL_CHECK" && actor.kind !== "admin") {
    return { ok: false, http: 403, error: "확인 중입니다", status: application.status };
  }
  if (application.status === "SUBMITTING" && actor.kind !== "admin") {
    return { ok: false, http: 409, error: "이미 처리 중입니다.", status: application.status };
  }

  const fromStatuses: PartnerApplicationStatus[] =
    actor.kind === "admin"
      ? ["NEEDS_MANUAL_CHECK", "FAILED", "CONTRACT_SIGNED", "SUBMITTING"]
      : ["CONTRACT_SIGNED", "FAILED"];
  if (!fromStatuses.includes(application.status)) {
    return { ok: false, http: 400, error: "코드 발급을 진행할 수 없는 상태입니다.", status: application.status };
  }
  if (application.status === "FAILED" && !application.signedAt) {
    return { ok: false, http: 400, error: "코드 발급을 진행할 수 없는 상태입니다.", status: application.status };
  }

  const issuedSameId = await getIssuedApplicationByEmpId(user.username);
  const validated = validateIssueFields({
    application,
    empId: user.username,
    empSsn1: user.rrnFront,
    issuedEmpIdTaken: Boolean(issuedSameId && issuedSameId.id !== application.id),
  });
  if (!validated.ok) {
    return { ok: false, http: 400, error: validated.error, status: application.status };
  }

  const claimed = await claimSubmitting(application.id, fromStatuses, {
    empId: user.username,
    idempotencyKey: application.idempotencyKey || issueIdempotencyKey(application.id),
    issueAttempts: (application.issueAttempts || 0) + 1,
  });
  if (!claimed) {
    const latest = await getApplicationByUserId(user.id);
    if (latest?.status === "ISSUED") {
      return { ok: true, status: "ISSUED", empCode: latest.empCode || "", already: true };
    }
    if (latest?.status === "SUBMITTING") {
      return { ok: false, http: 409, error: "이미 처리 중입니다.", status: "SUBMITTING" };
    }
    return { ok: false, http: 409, error: "이미 제출 중이거나 처리할 수 없는 상태입니다." };
  }
  application = claimed;

  await writeAuditLog({
    applicationId: application.id,
    userId: user.id,
    event: "EMP_REQ_SENT",
    meta: { payload: auditableEmployeePayload(validated.payload), dryRun: process.env.TY_API_DRY_RUN === "true" },
    ip: actor.ip,
    userAgent: actor.userAgent,
  });

  let call: TyCallResult;
  try {
    call = await registerEmployee(validated.payload, channelOrgName(application));
  } catch (error) {
    const saved = await patchApplication(application.id, {
      status: "NEEDS_MANUAL_CHECK",
      last_error_code: null,
      last_error_message: error instanceof Error ? error.message : "TY 호출 실패",
    });
    await writeAuditLog({
      applicationId: application.id,
      userId: user.id,
      event: "EMP_TIMEOUT",
      meta: { reason: "throw" },
      ip: actor.ip,
      userAgent: actor.userAgent,
    });
    await notifyAdminAlert(
      `사원코드 발급 수동 확인 필요\n신청 ${application.id}\n이름 ${application.certName || "-"}\n아이디 ${user.username}`,
    );
    return { ok: false, http: 202, error: "접수되었습니다. 발급 결과를 확인 중이며 곧 안내드립니다", status: saved.status };
  }

  const outcome = classifyTyOutcome(call);

  if (outcome.kind === "issued") {
    try {
      const saved = await patchApplication(application.id, {
        status: "ISSUED",
        emp_code: outcome.empCode,
        org_name: outcome.orgName || channelOrgName(application),
        issued_at: new Date().toISOString(),
        last_error_code: 0,
        last_error_message: null,
      });
      await writeAuditLog({
        applicationId: application.id,
        userId: user.id,
        event: "EMP_ISSUED",
        meta: { empCode: outcome.empCode, orgName: outcome.orgName, response: outcome.raw },
        ip: actor.ip,
        userAgent: actor.userAgent,
      });
      return { ok: true, status: "ISSUED", empCode: saved.empCode || outcome.empCode, already: false };
    } catch {
      await patchApplication(application.id, {
        status: "NEEDS_MANUAL_CHECK",
        last_error_message: "발급은 되었을 수 있으나 저장에 실패했습니다.",
      });
      await notifyAdminAlert(
        `사원코드 저장 실패 — TY 등록 여부 확인 필요\n신청 ${application.id}\nempCode ${outcome.empCode}`,
      );
      return {
        ok: false,
        http: 202,
        error: "접수되었습니다. 발급 결과를 확인 중이며 곧 안내드립니다",
        status: "NEEDS_MANUAL_CHECK",
      };
    }
  }

  if (outcome.kind === "invalid") {
    await patchApplication(application.id, {
      status: "FAILED",
      last_error_code: outcome.code,
      last_error_message: outcome.message,
    });
    await writeAuditLog({
      applicationId: application.id,
      userId: user.id,
      event: "EMP_FAILED",
      meta: { code: outcome.code, message: outcome.message, response: outcome.raw },
      ip: actor.ip,
      userAgent: actor.userAgent,
    });
    return {
      ok: false,
      http: 400,
      error: "정보가 일치하지 않아 발급에 실패했습니다",
      status: "FAILED",
    };
  }

  const timeout = outcome.reason === "timeout";
  await patchApplication(application.id, {
    status: "NEEDS_MANUAL_CHECK",
    last_error_code: outcome.code ?? null,
    last_error_message: outcome.message,
  });
  await writeAuditLog({
    applicationId: application.id,
    userId: user.id,
    event: timeout ? "EMP_TIMEOUT" : "EMP_FAILED",
    meta: {
      reason: outcome.reason,
      code: outcome.code,
      message: outcome.message,
      elapsedMs: call.elapsedMs,
      response: outcome.raw,
    },
    ip: actor.ip,
    userAgent: actor.userAgent,
  });
  await notifyAdminAlert(
    `사원코드 발급 수동 확인 필요 (${outcome.reason})\n신청 ${application.id}\n이름 ${application.certName || "-"}\n아이디 ${user.username}`,
  );
  return {
    ok: false,
    http: 202,
    error: "접수되었습니다. 발급 결과를 확인 중이며 곧 안내드립니다",
    status: "NEEDS_MANUAL_CHECK",
  };
}
