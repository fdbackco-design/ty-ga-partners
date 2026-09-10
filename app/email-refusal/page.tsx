import LegalLayout from "@/components/LegalLayout";

export const metadata = {
  title: "이메일 무단 수집거부 | TY파트너스 공식인증센터",
};

export default function EmailRefusalPage() {
  return (
    <LegalLayout title="이메일 무단 수집거부">
      <p>
        본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여
        무단으로 수집되는 것을 거부합니다.
      </p>
      <p>또한 이를 위반 시 정보통신망법에 의해 형사 처벌됨을 유념하시기 바랍니다.</p>
    </LegalLayout>
  );
}
