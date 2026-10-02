import Link from "next/link";
import ResourcesCategoryList from "@/components/ResourcesCategoryList";
import ResourcesHub from "@/components/ResourcesHub";

export const metadata = {
  title: "자료실 | TY파트너스 공식인증센터",
};

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const category = cat ? decodeURIComponent(cat) : "";

  if (category) {
    return (
      <main className="legal-page resource-index-page">
        <div className="wrap">
          <ResourcesCategoryList initialCat={category} />
        </div>
      </main>
    );
  }

  return (
    <main className="legal-page resource-index-page">
      <div className="wrap">
        <p className="resource-hub-eyebrow">RESOURCES</p>
        <p className="resource-index-crumb">
          <Link href="/">홈</Link> / 자료실
        </p>
        <h1 className="resource-index-title">자료실</h1>
        <p className="resource-hub-lead">필요한 자료 종류를 선택하세요.</p>
        <ResourcesHub />
      </div>
    </main>
  );
}
