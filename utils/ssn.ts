/**
 * NICE gender: 짝수=여성, 홀수=남성 (0/1 체계가 아님 — TY 확인 완료)
 * 반환값 = 주민등록번호 뒤 첫 자리
 */
export function ssnGenderCode(birthdate: string, gender: number, nationalinfo: string): string {
  const year = Number(birthdate.slice(0, 4));
  const isMale = gender % 2 === 1;
  const isForeign = String(nationalinfo) === "1";
  if (year < 2000) return isForeign ? (isMale ? "5" : "6") : isMale ? "1" : "2";
  return isForeign ? (isMale ? "7" : "8") : isMale ? "3" : "4";
}

const RRN_CENTURY: Record<string, "19" | "20"> = {
  "1": "19",
  "2": "19",
  "3": "20",
  "4": "20",
  "5": "19",
  "6": "19",
  "7": "20",
  "8": "20",
};

export function birthdateFromRrn(rrnFront: string, rrnBackFirst: string): string {
  const century = RRN_CENTURY[rrnBackFirst] ?? "20";
  return `${century}${rrnFront}`;
}

/**
 * TY 전산에는 주민번호 뒤 1자리(성별코드)만 전송하고 나머지는 0으로 채운다.
 * 계약서 PDF에는 뒤 7자리 전체가 인쇄된다 — 규칙이 서로 다르니 혼동 금지.
 */
export function toApiSsn2(genderCode: string): string {
  return genderCode.padEnd(7, "0");
}
