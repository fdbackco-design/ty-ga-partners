import { createHash } from "crypto";
import { afterEach, describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "./crypto";

describe("encryptSecret / decryptSecret", () => {
  const prev = process.env.ENCRYPTION_KEY;
  afterEach(() => {
    process.env.ENCRYPTION_KEY = prev;
  });

  it("같은 평문을 복호화하고 IV는 매번 다르다", () => {
    process.env.ENCRYPTION_KEY = "a".repeat(64);
    const a = encryptSecret("1234567");
    const b = encryptSecret("1234567");
    expect(a).not.toBe(b);
    expect(decryptSecret(a)).toBe("1234567");
    expect(decryptSecret(b)).toBe("1234567");
    expect(createHash("sha256").update("1234567").digest("hex")).not.toContain(":");
  });
});
