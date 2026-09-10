import { getAdminFromCookies } from "@/lib/admin";
import { getMemberFromCookies } from "@/lib/member";

export type Viewer = {
  isAdmin: boolean;
  username: string;
  name: string;
};

export async function getViewer(): Promise<Viewer | null> {
  const admin = await getAdminFromCookies();
  if (admin) return { isAdmin: true, username: admin, name: "관리자" };
  const member = await getMemberFromCookies();
  if (!member) return null;
  return { isAdmin: false, username: member.username, name: member.name };
}
