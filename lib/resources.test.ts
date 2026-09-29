import { describe, expect, it } from "vitest";
import {
  fileKindLabel,
  isAllowedResourceImageSrc,
  isSafeResourceBlobPath,
  isSafeResourceFilePath,
  normalizeStoredResource,
  publicResource,
  resourceFileSrc,
  sanitizeCategoryName,
  type ResourcePost,
} from "./resources";

const sample = {
  id: "1",
  title: "가이드",
  content: "본문",
  createdAt: "2026-01-01T00:00:00.000Z",
} as const;

describe("resource file URLs", () => {
  it("only allows resource blob paths", () => {
    expect(isSafeResourceBlobPath("resources/uploads/a.png")).toBe(true);
    expect(isSafeResourceBlobPath("inquiries/uploads/a.png")).toBe(false);
    expect(isSafeResourceBlobPath("../resources/a.png")).toBe(false);
  });

  it("allows local upload paths through the file route", () => {
    expect(isSafeResourceFilePath("uploads/resources/id/a.pdf")).toBe(true);
    expect(isSafeResourceFilePath("uploads/inquiries/a.pdf")).toBe(false);
  });

  it("turns private blob URLs into the resource file route", () => {
    expect(
      resourceFileSrc("https://store.private.blob.vercel-storage.com/resources/uploads/a.png"),
    ).toBe("/api/resources/file?path=resources%2Fuploads%2Fa.png");
  });

  it("turns local uploads into the resource file route", () => {
    expect(resourceFileSrc("/uploads/resources/id/a.pdf")).toBe(
      "/api/resources/file?path=uploads%2Fresources%2Fid%2Fa.pdf",
    );
  });

  it("allows editor image sources from the resource file route", () => {
    expect(isAllowedResourceImageSrc("/api/resources/file?path=resources%2Fuploads%2Fa.png")).toBe(true);
    expect(isAllowedResourceImageSrc("/api/resources/file?path=uploads%2Fresources%2Fa.png")).toBe(true);
    expect(isAllowedResourceImageSrc("/api/resources/file?path=contracts%2Fa.png")).toBe(false);
  });
});

describe("resource posts", () => {
  it("keeps a legacy single file as files[]", () => {
    const item = normalizeStoredResource({
      ...sample,
      category: "교육",
      files: [],
      fileName: "guide.pdf",
      fileUrl: "/uploads/resources/1/guide.pdf",
      fileSize: 2048,
    } as ResourcePost);
    expect(item.files).toEqual([{ name: "guide.pdf", url: "/uploads/resources/1/guide.pdf", size: 2048 }]);
    expect(fileKindLabel(item)).toBe("PDF");
  });

  it("hides download URLs when the viewer cannot download", () => {
    const item = publicResource(
      normalizeStoredResource({
        ...sample,
        category: "교육",
        files: [
          { name: "a.pdf", url: "/uploads/resources/1/a.pdf", size: 10 },
          { name: "b.mp4", url: "/uploads/resources/1/b.mp4", size: 20 },
        ],
        fileName: "",
        fileUrl: "",
        fileSize: 0,
      }),
      false,
    );
    expect(item.files.every((file) => file.url === "")).toBe(true);
    expect(item.fileUrl).toBe("");
    expect(item.files.map((file) => file.name)).toEqual(["a.pdf", "b.mp4"]);
  });

  it("sanitizes category names", () => {
    expect(sanitizeCategoryName("  교육 자료  ")).toBe("교육 자료");
    expect(sanitizeCategoryName("")).toBe("");
    expect(sanitizeCategoryName("가".repeat(21))).toBe("");
  });
});
