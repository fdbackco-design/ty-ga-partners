export function formatSsn(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

export function maskSsn(front6: string, back7: string) {
  const first = back7.slice(0, 1) || "●";
  return `${front6}-${first}●●●●●●`;
}

export function maskAccount(accountNo: string) {
  const digits = accountNo.replace(/\D/g, "");
  if (digits.length <= 6) return `${digits}-**-*****`;
  return `${digits.slice(0, 6)}-**-*****`;
}

const SSN_WEIGHTS = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];

export function ssnCheckDigit(digits12: string) {
  if (!/^\d{12}$/.test(digits12)) return "";
  let sum = 0;
  for (let i = 0; i < 12; i += 1) sum += Number(digits12[i]) * SSN_WEIGHTS[i];
  return String((11 - (sum % 11)) % 10);
}

export function stubSsnBack(front6: string, genderCode: string) {
  if (!/^\d{6}$/.test(front6) || !/^[1-8]$/.test(genderCode)) return "";
  const twelve = `${front6}${genderCode}00000`;
  return `${genderCode}00000${ssnCheckDigit(twelve)}`;
}

export function isValidSsnChecksum(front6: string, back7: string) {
  const digits = `${front6}${back7}`.replace(/\D/g, "");
  if (!/^\d{13}$/.test(digits)) return false;
  return ssnCheckDigit(digits.slice(0, 12)) === digits[12];
}

export function isValidBizRegNo(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!/^\d{10}$/.test(digits)) return false;
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(digits[i]) * weights[i];
  sum += Math.floor((Number(digits[8]) * 5) / 10);
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[9]);
}

export function formatBizRegNo(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}
