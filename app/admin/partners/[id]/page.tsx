import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PartnerAdminDetail from "@/components/admin/PartnerAdminDetail";
import { getAdminFromCookies } from "@/lib/admin";
import { getApplicationById, listAuditLogs, writeAuditLog } from "@/lib/partnerApplicationsStore";
import { findUserById } from "@/lib/usersStore";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export const metadata = {
  title: "신청 상세 | TY파트너스 공식인증센터",
};

export default async function AdminPartnerDetailPage({ params }: PageProps) {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/login?next=/admin/partners");
  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) notFound();
  const user = await findUserById(application.userId);
  const logs = await listAuditLogs(application.id);
  await writeAuditLog({
    applicationId: application.id,
    userId: application.userId,
    event: "ADMIN_VIEW",
    meta: { admin, detail: true, source: "page" },
  });
  return (
    <main className="legal-page">
      <div className="wrap">
        <p className="text-sm text-[var(--sub)]">
          <Link href="/">홈</Link> / <Link href="/admin/partners">파트너 신청</Link> / 상세
        </p>
        <h1 className="legal-title">신청 상세</h1>
        <div className="mt-10">
          <PartnerAdminDetail
            key={application.updatedAt}
            initial={{
              application: {
                id: application.id,
                status: application.status,
                channelSlug: application.channelSlug,
                orgCode: application.orgCode,
                orgName: application.orgName,
                joinChannel: application.joinChannel,
                certName: application.certName,
                certMobile: application.certMobile,
                ssnMasked: application.ssnMasked,
                zipCode: application.zipCode,
                address1: application.address1,
                address2: application.address2,
                bankName: application.bankName,
                accountNoMasked: application.accountNoMasked,
                accountHolder: application.accountHolder,
                agreements: application.agreements,
                privacyAgreed: application.privacyAgreed,
                docToken: application.docToken,
                docHash: application.docHash,
                docRevoked: application.docRevoked,
                signedAt: application.signedAt,
                empId: application.empId || user?.username || "",
                empCode: application.empCode,
                issuedAt: application.issuedAt,
                issueAttempts: application.issueAttempts,
                lastErrorCode: application.lastErrorCode,
                lastErrorMessage: application.lastErrorMessage,
                manualCheckNote: application.manualCheckNote,
              },
              user: user
                ? { username: user.username, name: user.name, phone: user.phone, rrnFront: user.rrnFront }
                : null,
              logs,
            }}
          />
        </div>
      </div>
    </main>
  );
}
