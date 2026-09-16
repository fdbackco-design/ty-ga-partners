import Link from "next/link";
import ResourcesBoard from "@/components/ResourcesBoard";

export const metadata = {
  title: "자료실 | TY파트너스 공식인증센터",
};

export default function ResourcesPage() {
  return (
    <main className="legal-page resource-index-page">
      <div className="wrap">
        <p className="resource-index-crumb">
          <Link href="/">홈</Link> / 자료실
        </p>
        <h1 className="resource-index-title">자료실</h1>
        <ResourcesBoard />
      </div>
    </main>
  );
}
