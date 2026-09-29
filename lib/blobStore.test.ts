import { describe, expect, it } from "vitest";
import { blobPathnameFromUrl } from "./blobStore";

describe("blobPathnameFromUrl", () => {
  it("extracts the object path from a Vercel Blob URL", () => {
    expect(blobPathnameFromUrl("https://store.private.blob.vercel-storage.com/inquiries/index.json")).toBe(
      "inquiries/index.json",
    );
    expect(blobPathnameFromUrl("https://store.public.blob.vercel-storage.com/inquiries/uploads/1-photo.png")).toBe(
      "inquiries/uploads/1-photo.png",
    );
  });

  it("returns empty for non-blob URLs", () => {
    expect(blobPathnameFromUrl("/uploads/inquiries/1/file.png")).toBe("");
    expect(blobPathnameFromUrl("not-a-url")).toBe("");
  });
});
