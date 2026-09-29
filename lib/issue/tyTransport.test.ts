import { describe, expect, it } from "vitest";
import { isSecureTyApiBaseUrl } from "./tyTransport";

describe("isSecureTyApiBaseUrl", () => {
  it("https는 허용한다", () => {
    expect(isSecureTyApiBaseUrl("https://ty.example.com")).toBe(true);
  });

  it("localhost http는 허용한다", () => {
    expect(isSecureTyApiBaseUrl("http://localhost:8080")).toBe(true);
  });

  it("원격 http는 명시적으로 허용할 때만 통과한다", () => {
    expect(isSecureTyApiBaseUrl("http://ludus-server.iptime.org")).toBe(false);
    expect(isSecureTyApiBaseUrl("http://ludus-server.iptime.org", true)).toBe(true);
  });
});
