import ApplyEntry from "@/components/partners/ApplyEntry";
import { requireApplyAccess } from "@/lib/partnerAccess";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "코드 발급 신청 | TY파트너스 공식인증센터",
};

export default async function PartnersApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ ch?: string }>;
}) {
  const { ch } = await searchParams;
  await requireApplyAccess(ch ? `/partners/apply?ch=${encodeURIComponent(ch)}` : "/partners/apply", ch);
  return <ApplyEntry />;
}
