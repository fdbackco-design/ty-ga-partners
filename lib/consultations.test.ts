import { describe, expect, it } from "vitest";
import {
  canViewConsultation,
  consultListTitle,
  toConsultationSummary,
  validateConsultBirthdate,
  type Consultation,
} from "./consultations";

const item: Consultation = {
  id: "c-1",
  name: "홍길동",
  birthdate: "1990-03-11",
  phone: "01012345678",
  content: "상품 상담을 받고 싶습니다.",
  replies: [],
  createdAt: "2026-09-30T00:00:00.000Z",
};

describe("canViewConsultation", () => {
  it("신청 브라우저와 관리자만 열람할 수 있다", () => {
    expect(canViewConsultation(item, null)).toBe(false);
    expect(canViewConsultation(item, { isAdmin: false, ownedIds: [] })).toBe(false);
    expect(canViewConsultation(item, { isAdmin: false, ownedIds: ["c-1"] })).toBe(true);
    expect(canViewConsultation(item, { isAdmin: true, ownedIds: [] })).toBe(true);
  });
});

describe("toConsultationSummary", () => {
  it("다른 사람에게는 제목과 신청자를 가린다", () => {
    const summary = toConsultationSummary(item, { isAdmin: false, ownedIds: [] });
    expect(summary.title).toBe("비밀글입니다");
    expect(summary.name).toBe("신청자");
    expect(summary.canView).toBe(false);
    expect(summary.phone).toBe("");
  });

  it("신청자와 관리자에게는 내용을 보여 준다", () => {
    const owner = toConsultationSummary(item, { isAdmin: false, ownedIds: ["c-1"] });
    expect(owner.title).toBe("상품 상담을 받고 싶습니다.");
    expect(owner.name).toBe("홍길동");
    expect(owner.phone).toBe("");
    const admin = toConsultationSummary(item, { isAdmin: true, ownedIds: [] });
    expect(admin.title).toBe("상품 상담을 받고 싶습니다.");
    expect(admin.phone).toBe("01012345678");
    expect(admin.birthdate).toBe("1990-03-11");
  });
});

describe("validateConsultBirthdate", () => {
  it("올바른 날짜만 받는다", () => {
    expect(validateConsultBirthdate("1990-03-11")).toBe("");
    expect(validateConsultBirthdate("1990-13-11")).toBe("생년월일을 다시 확인해 주세요.");
    expect(validateConsultBirthdate("")).toBe("생년월일을 입력해 주세요.");
  });
});

describe("consultListTitle", () => {
  it("긴 상담 내용은 목록용으로 줄인다", () => {
    expect(consultListTitle("짧음")).toBe("짧음");
    expect(consultListTitle("가".repeat(40)).endsWith("…")).toBe(true);
  });
});
