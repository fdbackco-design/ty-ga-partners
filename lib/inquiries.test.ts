import { describe, expect, it } from "vitest";
import { canViewInquiry, inquiryAttachmentSrc, toInquirySummary, type Inquiry } from "./inquiries";

const item: Inquiry = {
  id: "id-1",
  title: "정산 일정 문의",
  content: "본문",
  secret: false,
  authorUsername: "member1",
  authorName: "홍길동",
  authorPhone: "01012345678",
  attachments: [],
  replies: [],
  createdAt: "2026-09-29T00:00:00.000Z",
};

describe("inquiryAttachmentSrc", () => {
  it("keeps local upload paths", () => {
    expect(inquiryAttachmentSrc("id-1", { url: "/uploads/inquiries/id-1/1-a.png" }, 0)).toBe(
      "/uploads/inquiries/id-1/1-a.png",
    );
  });

  it("proxies remote blob URLs through the inquiry file route", () => {
    expect(
      inquiryAttachmentSrc("id-1", { url: "https://store.private.blob.vercel-storage.com/inquiries/uploads/a.png" }, 2),
    ).toBe("/api/inquiries/id-1/files/2");
  });
});

describe("canViewInquiry", () => {
  it("작성자와 관리자만 열람할 수 있다", () => {
    expect(canViewInquiry(item, null)).toBe(false);
    expect(canViewInquiry(item, { isAdmin: false, username: "other", name: "다른사람", phone: "" })).toBe(false);
    expect(canViewInquiry(item, { isAdmin: false, username: "member1", name: "홍길동", phone: "" })).toBe(true);
    expect(canViewInquiry(item, { isAdmin: true, username: "admin", name: "관리자", phone: "" })).toBe(true);
  });
});

describe("toInquirySummary", () => {
  it("다른 사람에게는 제목과 작성자를 가린다", () => {
    const summary = toInquirySummary(item, { isAdmin: false, username: "other", name: "다른사람", phone: "" });
    expect(summary.title).toBe("비밀글입니다");
    expect(summary.authorName).toBe("회원");
    expect(summary.canView).toBe(false);
  });

  it("작성자와 관리자에게는 제목과 작성자를 보여 준다", () => {
    const owner = toInquirySummary(item, { isAdmin: false, username: "member1", name: "홍길동", phone: "" });
    expect(owner.title).toBe("정산 일정 문의");
    expect(owner.authorName).toBe("홍길동");
    const admin = toInquirySummary(item, { isAdmin: true, username: "admin", name: "관리자", phone: "" });
    expect(admin.title).toBe("정산 일정 문의");
    expect(admin.authorName).toBe("홍길동");
  });
});
