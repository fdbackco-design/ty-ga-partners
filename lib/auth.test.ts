import { describe, expect, it } from "vitest";
import { formatPhoneDisplay } from "./auth";

describe("formatPhoneDisplay", () => {
  it("11자리 휴대폰을 하이픈 형식으로 만든다", () => {
    expect(formatPhoneDisplay("01012345678")).toBe("010-1234-5678");
    expect(formatPhoneDisplay("010-1234-5678")).toBe("010-1234-5678");
  });
});
