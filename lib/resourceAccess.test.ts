import { describe, expect, it, vi } from "vitest";
import { getResourceAccess } from "./resourceAccess";

vi.mock("@/lib/viewer", () => ({
  getViewer: vi.fn(),
}));

vi.mock("@/lib/usersStore", () => ({
  findUserByUsername: vi.fn(),
}));

vi.mock("@/lib/partnerApplicationsStore", () => ({
  getApplicationByUserId: vi.fn(),
  isIssued: vi.fn((app: { status: string } | null) => app?.status === "ISSUED"),
}));

import { getViewer } from "@/lib/viewer";
import { findUserByUsername } from "@/lib/usersStore";
import { getApplicationByUserId } from "@/lib/partnerApplicationsStore";

describe("getResourceAccess", () => {
  it("발급 완료 회원은 다운로드·영상 재생이 가능하다", async () => {
    vi.mocked(getViewer).mockResolvedValue({
      isAdmin: false,
      username: "partner1",
      name: "홍길동",
      phone: "01012345678",
    });
    vi.mocked(findUserByUsername).mockResolvedValue({
      id: "user-uuid",
      username: "partner1",
      usernameLower: "partner1",
      passwordHash: "hash",
      name: "홍길동",
      phone: "01012345678",
      rrnFront: "900101",
      rrnBackFirst: "1",
      channel: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    vi.mocked(getApplicationByUserId).mockResolvedValue({
      status: "ISSUED",
    } as Awaited<ReturnType<typeof getApplicationByUserId>>);

    const access = await getResourceAccess();
    expect(access.canView).toBe(true);
    expect(access.canDownload).toBe(true);
  });

  it("로그인만 한 회원은 조회만 가능하다", async () => {
    vi.mocked(getViewer).mockResolvedValue({
      isAdmin: false,
      username: "guest1",
      name: "김",
      phone: "010",
    });
    vi.mocked(findUserByUsername).mockResolvedValue({
      id: "user-2",
      username: "guest1",
      usernameLower: "guest1",
      passwordHash: "hash",
      name: "김",
      phone: "010",
      rrnFront: "900101",
      rrnBackFirst: "1",
      channel: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    vi.mocked(getApplicationByUserId).mockResolvedValue({
      status: "CONTRACT_SIGNED",
    } as Awaited<ReturnType<typeof getApplicationByUserId>>);

    const access = await getResourceAccess();
    expect(access.canView).toBe(true);
    expect(access.canDownload).toBe(false);
  });
});
