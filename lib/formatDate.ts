const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function formatKstDateTime(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const hour = String(kst.getUTCHours()).padStart(2, "0");
  const minute = String(kst.getUTCMinutes()).padStart(2, "0");
  const second = String(kst.getUTCSeconds()).padStart(2, "0");
  return `${year}. ${month}. ${day}. ${hour}:${minute}:${second}`;
}
