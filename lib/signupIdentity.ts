import { normalizeName } from "@/lib/partnerCert";
import { birthdateFromRrn } from "@/utils/ssn";

export const SIGNUP_DUPLICATE_MESSAGE =
  "이미 가입된 회원입니다. 아이디/비밀번호 찾기를 이용해 주세요.";

export type NameAndBirth = {
  name: string;
  rrnFront: string;
  rrnBackFirst: string;
};

export function sameNameAndBirthdate(left: NameAndBirth, right: NameAndBirth) {
  if (normalizeName(left.name) !== normalizeName(right.name)) return false;
  return (
    birthdateFromRrn(left.rrnFront, left.rrnBackFirst) ===
    birthdateFromRrn(right.rrnFront, right.rrnBackFirst)
  );
}
