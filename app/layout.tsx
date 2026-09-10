import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SideQuick from "@/components/SideQuick";
import FloatingCta from "@/components/FloatingCta";
import BackToTop from "@/components/BackToTop";
import "./globals.css";

export const metadata: Metadata = {
  title: "TY파트너스 공식인증센터",
  description: "업계 최상위 리워드 TA-GA 파트너스. TY 1인 GA파트너스로 하루 1시간, 언제 어디서든 시작하세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full pb-20 md:pb-8">
        <Header />
        {children}
        <Footer />
        <SideQuick />
        <FloatingCta />
        <BackToTop />
      </body>
    </html>
  );
}
