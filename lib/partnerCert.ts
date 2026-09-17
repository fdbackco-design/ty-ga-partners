export const TY_CERT_URL = process.env.NEXT_PUBLIC_TY_CERT_URL || "https://n.ty-life.co.kr/api/cert";

export function tyCertOrigin() {
  try {
    return new URL(TY_CERT_URL).origin;
  } catch {
    return "https://n.ty-life.co.kr";
  }
}

export function maskName(name: string) {
  const value = name.trim();
  if (value.length <= 1) return value;
  if (value.length === 2) return `${value[0]}*`;
  return `${value[0]}*${value[value.length - 1]}`;
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "010-****-****";
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

export function maskDi(di: string) {
  return di.slice(0, 8);
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function parseEnctime(enctime: string): Date | null {
  if (!/^\d{14}$/.test(enctime)) return null;
  const iso = `${enctime.slice(0, 4)}-${enctime.slice(4, 6)}-${enctime.slice(6, 8)}T${enctime.slice(8, 10)}:${enctime.slice(10, 12)}:${enctime.slice(12, 14)}+09:00`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isEnctimeFresh(enctime: string, now = Date.now(), windowMs = 10 * 60 * 1000) {
  const date = parseEnctime(enctime);
  if (!date) return false;
  return Math.abs(now - date.getTime()) <= windowMs;
}
