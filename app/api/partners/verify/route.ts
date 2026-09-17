import { NextResponse } from "next/server";
import { z } from "zod";
import { getSignedInMemberUser, readChannelFromCookies } from "@/lib/partnerAccess";
import {
  countCertAttempts,
  ensureDraftApplication,
  getApplicationByDi,
  markApplicationFailed,
  saveVerifiedApplication,
  writeAuditLog,
} from "@/lib/partnerApplicationsStore";
import { digitsOnly, isEnctimeFresh, maskDi } from "@/lib/partnerCert";
import { createVerifyToken, VERIFY_COOKIE, verifyCookieOptions } from "@/lib/partnerVerifyToken";
import { clientIp, clientUserAgent } from "@/lib/requestMeta";
import { birthdateFromRrn, ssnGenderCode } from "@/utils/ssn";

export const runtime = "nodejs";

const MAX_ATTEMPTS_PER_HOUR = 5;

const nicePayloadSchema = z.object({
  errorMsg: z.string().optional(),
  authtype: z.string().optional(),
  nationalinfo: z.union([z.string(), z.number()]).transform((value) => String(value)),
  responseno: z.string().optional().default(""),
  resultcode: z.string(),
  enctime: z.string(),
  requestno: z.string().optional(),
  mobileco: z.string().optional(),
  mobileno: z.string(),
  sitecode: z.string().optional(),
  di: z.string(),
  receivedata: z.string().optional(),
  birthdate: z.string(),
  gender: z.coerce.number(),
  name: z.string(),
});

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, "");
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const userAgent = clientUserAgent(request);
  const user = await getSignedInMemberUser();
  if (!user) {
    return NextResponse.json({ error: "로그인 후 본인인증을 진행해 주세요." }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const parsed = nicePayloadSchema.safeParse(raw);
  if (!parsed.success) {
    await writeAuditLog({
      userId: user.id,
      event: "ERROR",
      meta: { reason: "invalid_payload" },
      ip,
      userAgent,
    });
    return NextResponse.json({ error: "인증 결과가 올바르지 않습니다." }, { status: 400 });
  }

  const payload = parsed.data;
  const channel = await readChannelFromCookies();
  const application = await ensureDraftApplication(user.id, channel);

  try {
    const attempts = await countCertAttempts(user.id);
    if (attempts >= MAX_ATTEMPTS_PER_HOUR) {
      return NextResponse.json({ error: "인증 시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
    }

    // TODO(확인필요): TY 서버 간 인증 결과 조회 API 제공되면 3.2에 검증 단계 추가할 것
    if (payload.resultcode !== "0000") {
      await writeAuditLog({
        applicationId: application.id,
        userId: user.id,
        event: "ERROR",
        meta: { reason: "resultcode", resultcode: payload.resultcode, diPrefix: maskDi(payload.di) },
        ip,
        userAgent,
      });
      return NextResponse.json({ error: "본인인증에 실패했습니다." }, { status: 400 });
    }

    if (!isEnctimeFresh(payload.enctime)) {
      await writeAuditLog({
        applicationId: application.id,
        userId: user.id,
        event: "ERROR",
        meta: { reason: "enctime", diPrefix: maskDi(payload.di) },
        ip,
        userAgent,
      });
      return NextResponse.json({ error: "인증 유효 시간이 지났습니다. 다시 인증해 주세요." }, { status: 400 });
    }

    const registeredBirth = birthdateFromRrn(user.rrnFront, user.rrnBackFirst);
    const genderCode = ssnGenderCode(payload.birthdate, payload.gender, payload.nationalinfo);
    const mobile = digitsOnly(payload.mobileno);
    const matched =
      normalizeName(payload.name) === normalizeName(user.name) &&
      payload.birthdate === registeredBirth &&
      mobile === digitsOnly(user.phone) &&
      payload.birthdate.slice(2) === user.rrnFront &&
      genderCode === user.rrnBackFirst;

    if (!matched) {
      await writeAuditLog({
        applicationId: application.id,
        userId: user.id,
        event: "CERT_MISMATCH",
        meta: { diPrefix: maskDi(payload.di) },
        ip,
        userAgent,
      });
      return NextResponse.json({ error: "회원가입 정보와 본인인증 정보가 일치하지 않습니다." }, { status: 400 });
    }

    const duplicate = await getApplicationByDi(payload.di);
    if (duplicate && duplicate.userId !== user.id) {
      await markApplicationFailed(application.id);
      await writeAuditLog({
        applicationId: application.id,
        userId: user.id,
        event: "CERT_DUPLICATE_DI",
        meta: { diPrefix: maskDi(payload.di) },
        ip,
        userAgent,
      });
      return NextResponse.json({ error: "이미 코드가 발급된 분입니다" }, { status: 409 });
    }

    const saved = await saveVerifiedApplication(application.id, {
      certName: payload.name.trim(),
      certBirthdate: payload.birthdate,
      certMobile: mobile,
      certGender: payload.gender,
      certNational: payload.nationalinfo,
      certDi: payload.di,
      certResponseNo: payload.responseno,
      ssnGenderCode: genderCode,
    });

    await writeAuditLog({
      applicationId: saved.id,
      userId: user.id,
      event: "CERT_SUCCESS",
      meta: { diPrefix: maskDi(payload.di), resultcode: payload.resultcode },
      ip,
      userAgent,
    });

    const res = NextResponse.json({ ok: true, status: saved.status });
    res.cookies.set(
      VERIFY_COOKIE,
      createVerifyToken({ userId: user.id, applicationId: saved.id }),
      verifyCookieOptions(),
    );
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : "본인인증 검증에 실패했습니다.";
    await writeAuditLog({
      applicationId: application.id,
      userId: user.id,
      event: "ERROR",
      meta: { reason: "exception" },
      ip,
      userAgent,
    });
    if (message.includes("이미 코드가 발급된")) {
      return NextResponse.json({ error: "이미 코드가 발급된 분입니다" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
