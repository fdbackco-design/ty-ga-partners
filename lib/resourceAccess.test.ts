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
import type { StoredUser } from "@/lib/usersStore";

const mockUser = (overrides: Partial<StoredUser> & Pick<StoredUser, "id" | "username">): StoredUser => ({
  passwordHash: "hash",
  name: "테스트",
  phone: "01012345678",
  rrnFront: "900101",
  rrnBackFirst: "1",
  channel: "",
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("getResourceAccess", () => {
  it("발급 완료 회원은 다운로드·영상 재생이 가능하다", async () => {
    vi.mocked(getViewer).mockResolvedValue({
      isAdmin: false,
      username: "partner1",
      name: "홍길동",
      phone: "01012345678",
    });
    vi.mocked(findUserByUsername).mockResolvedValue(
      mockUser({ id: "user-uuid", username: "partner1", name: "홍길동", phone: "01012345678" }),
    );
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
    vi.mocked(findUserByUsername).mockResolvedValue(
      mockUser({ id: "user-2", username: "guest1", name: "김", phone: "010" }),
    );
    vi.mocked(getApplicationByUserId).mockResolvedValue({
      status: "CONTRACT_SIGNED",
    } as Awaited<ReturnType<typeof getApplicationByUserId>>);

    const access = await getResourceAccess();
    expect(access.canView).toBe(true);
    expect(access.canDownload).toBe(false);
  });
});
