import Link from "next/link";

export const metadata = {
  title: "페이지를 찾을 수 없습니다 | TY파트너스 공식인증센터",
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="wrap">
        <h1>페이지를 찾을 수 없습니다.</h1>
        <p className="not-found-copy">
          요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.
          <br />
          주소를 다시 확인하거나 홈으로 이동해 주세요.
        </p>
        <Link href="/" className="btn-apply">
          홈으로 가기
        </Link>
      </div>
    </main>
  );
}
