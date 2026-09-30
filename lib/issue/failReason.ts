export type IssueFailKind = "already_issued" | "mismatch" | "failed";

export const TY_ISSUE_CODE = {
  invalid: -1000,
  alreadyIssued: -7000,
} as const;

const ALREADY_ISSUED_RE = /이미\s*(코드가\s*)?발급|이미\s*등록|중복\s*(등록|발급)/;
const MISMATCH_RE = /인자|일치하지|주민등록|휴대폰|성명/;

export function classifyIssueFail(input: { code?: number | null; message?: string | null }): IssueFailKind {
  const code = input.code ?? null;
  const message = String(input.message || "");
  if (code === TY_ISSUE_CODE.alreadyIssued || ALREADY_ISSUED_RE.test(message)) {
    return "already_issued";
  }
  if (code === TY_ISSUE_CODE.invalid || MISMATCH_RE.test(message)) {
    return "mismatch";
  }
  return "failed";
}

export function issueFailCopy(kind: IssueFailKind) {
  if (kind === "already_issued") {
    return {
      title: "이미 사원코드가 발급된 분입니다.",
      hint: "이전에 발급받으신 아이디로 로그인해 주세요. 아이디가 기억나지 않으면 아이디 찾기를 이용해 주세요.",
      retry: false,
    };
  }
  if (kind === "mismatch") {
    return {
      title: "정보가 일치하지 않아 발급에 실패했습니다.",
      hint: "성명·주민번호·휴대폰이 맞는지 확인한 뒤 다시 신청해 주세요.",
      retry: true,
    };
  }
  return {
    title: "사원코드 발급에 실패했습니다.",
    hint: "잠시 후 다시 신청해 주세요. 계속되면 본사 고객센터로 문의해 주세요.",
    retry: true,
  };
}
