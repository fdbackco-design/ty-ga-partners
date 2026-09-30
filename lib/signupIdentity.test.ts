import { describe, expect, it } from "vitest";
import { sameNameAndBirthdate } from "./signupIdentity";

describe("sameNameAndBirthdate", () => {
  it("이름과 생년월일이 같으면 휴대폰과 무관하게 동일인으로 본다", () => {
    expect(
      sameNameAndBirthdate(
        { name: "홍 길동", rrnFront: "900311", rrnBackFirst: "1" },
        { name: "홍길동", rrnFront: "900311", rrnBackFirst: "2" },
      ),
    ).toBe(true);
  });

  it("생년월일이 다르면 다른 사람으로 본다", () => {
    expect(
      sameNameAndBirthdate(
        { name: "홍길동", rrnFront: "900311", rrnBackFirst: "1" },
        { name: "홍길동", rrnFront: "900312", rrnBackFirst: "1" },
      ),
    ).toBe(false);
  });

  it("세기가 다른 같은 앞자리는 다른 생년월일로 본다", () => {
    expect(
      sameNameAndBirthdate(
        { name: "홍길동", rrnFront: "900311", rrnBackFirst: "1" },
        { name: "홍길동", rrnFront: "900311", rrnBackFirst: "3" },
      ),
    ).toBe(false);
  });

  it("이름이 다르면 다른 사람으로 본다", () => {
    expect(
      sameNameAndBirthdate(
        { name: "홍길동", rrnFront: "900311", rrnBackFirst: "1" },
        { name: "김길동", rrnFront: "900311", rrnBackFirst: "1" },
      ),
    ).toBe(false);
  });
});
