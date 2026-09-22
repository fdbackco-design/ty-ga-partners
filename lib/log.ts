import { maskSsn } from "@/lib/contract/validate";

export function redactSecrets(value: string) {
  return value
    .replace(/\b\d{6}[-\s]?\d{7}\b/g, (match) => {
      const digits = match.replace(/\D/g, "");
      return maskSsn(digits.slice(0, 6), digits.slice(6));
    })
    .replace(/(계좌번호|account(?:_?no)?|acc)[=:\s_-]*\d{8,16}/gi, (match) =>
      match.replace(/\d{8,16}/, (digits) => `${digits.slice(0, 6)}-**-*****`),
    );
}

export function logError(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${scope}]`, redactSecrets(message));
}
