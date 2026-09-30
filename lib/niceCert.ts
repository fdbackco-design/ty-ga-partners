import { z } from "zod";
import { isEnctimeFresh } from "@/lib/partnerCert";

export const niceCertPayloadSchema = z.object({
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

export type NiceCertPayload = z.infer<typeof niceCertPayloadSchema>;

export function niceCertError(payload: NiceCertPayload) {
  if (payload.resultcode !== "0000") return "본인인증에 실패했습니다.";
  if (!isEnctimeFresh(payload.enctime)) return "인증 유효 시간이 지났습니다. 다시 인증해 주세요.";
  return "";
}
