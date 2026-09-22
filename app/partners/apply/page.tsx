import ApplyEntry from "@/components/partners/ApplyEntry";
import { isResumable } from "@/lib/partnerApplicationsStore";
import { requireApplyAccess } from "@/lib/partnerAccess";
import { getVerifySessionFromCookies } from "@/lib/partnerVerifyToken";

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
  const { user, application } = await requireApplyAccess(
    ch ? `/partners/apply?ch=${encodeURIComponent(ch)}` : "/partners/apply",
    ch,
  );
  const verify = await getVerifySessionFromCookies();
  const tokenOk = Boolean(verify && verify.userId === user.id && verify.applicationId === application.id);
  return <ApplyEntry resume={isResumable(application)} needRecert={isResumable(application) && !tokenOk} />;
}
