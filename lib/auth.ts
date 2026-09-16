export type UserProfile = {
  username: string;
  name: string;
  phone: string;
  rrnFront: string;
  rrnBackFirst: string;
};

export function validateUsername(value: string) {
  const username = value.trim();
  if (!username) return "아이디를 입력해 주세요.";
  if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
    return "아이디는 영문, 숫자, 밑줄(_) 4~20자로 입력해 주세요.";
  }
  return "";
}

export function validatePassword(value: string) {
  if (!value) return "비밀번호를 입력해 주세요.";
  if (value.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  return "";
}

export function validateName(value: string) {
  if (!value.trim()) return "이름을 입력해 주세요.";
  return "";
}

export function validatePhone(value: string) {
  const phone = value.replace(/\D/g, "");
  if (!phone) return "전화번호를 입력해 주세요.";
  if (!/^01[016789]\d{7,8}$/.test(phone)) {
    return "전화번호는 010 등 휴대폰 번호, 숫자만 입력해 주세요.";
  }
  return "";
}

export function validateRrnFront(value: string) {
  if (!/^\d{6}$/.test(value)) return "주민등록번호 앞 6자리를 입력해 주세요.";
  const month = Number(value.slice(2, 4));
  const day = Number(value.slice(4, 6));
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return "주민등록번호 앞자리를 다시 확인해 주세요.";
  }
  return "";
}

export function validateRrnBackFirst(value: string) {
  if (!/^[1-8]$/.test(value)) return "주민등록번호 뒤 첫 1자리를 입력해 주세요.";
  return "";
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}
