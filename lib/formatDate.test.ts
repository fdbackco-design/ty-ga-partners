import { describe, expect, it } from "vitest";
import { formatKstDateTime } from "./formatDate";

describe("formatKstDateTime", () => {
  it("KST로 고정된 문자열을 만든다", () => {
    expect(formatKstDateTime("2026-09-22T09:30:02.419Z")).toBe("2026. 9. 22. 18:30:02");
    expect(formatKstDateTime(null)).toBe("-");
    expect(formatKstDateTime("not-a-date")).toBe("-");
  });
});
