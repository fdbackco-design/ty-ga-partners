export const BANKS = [
  { code: "004", name: "KB국민은행", hint: "10~14자리" },
  { code: "088", name: "신한은행", hint: "11~14자리" },
  { code: "020", name: "우리은행", hint: "11~14자리" },
  { code: "081", name: "하나은행", hint: "11~14자리" },
  { code: "011", name: "NH농협은행", hint: "11~14자리" },
  { code: "003", name: "IBK기업은행", hint: "10~14자리" },
  { code: "023", name: "SC제일은행", hint: "11~14자리" },
  { code: "027", name: "씨티은행", hint: "10~14자리" },
  { code: "090", name: "카카오뱅크", hint: "13자리" },
  { code: "089", name: "케이뱅크", hint: "12~13자리" },
  { code: "092", name: "토스뱅크", hint: "12~15자리" },
  { code: "071", name: "우체국", hint: "10~14자리" },
  { code: "031", name: "대구은행", hint: "11~14자리" },
  { code: "032", name: "부산은행", hint: "11~14자리" },
  { code: "034", name: "광주은행", hint: "10~14자리" },
  { code: "035", name: "제주은행", hint: "10~14자리" },
  { code: "037", name: "전북은행", hint: "10~14자리" },
  { code: "039", name: "경남은행", hint: "10~14자리" },
  { code: "045", name: "새마을금고", hint: "10~14자리" },
  { code: "048", name: "신협", hint: "10~14자리" },
  { code: "050", name: "저축은행", hint: "10~14자리" },
] as const;

export type BankCode = (typeof BANKS)[number]["code"];

export function findBank(code: string) {
  return BANKS.find((bank) => bank.code === code) ?? null;
}
