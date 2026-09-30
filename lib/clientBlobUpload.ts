import { upload } from "@vercel/blob/client";

type ClientBlob = Awaited<ReturnType<typeof upload>>;

export async function uploadClientBlob(pathname: string, file: File, handleUploadUrl: string): Promise<ClientBlob> {
  return upload(pathname, file, {
    access: "private",
    handleUploadUrl,
    multipart: true,
  });
}
