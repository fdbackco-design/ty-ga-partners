import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteWidgets from "@/components/SiteWidgets";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "TY파트너스 공식인증센터",
  description: "업계 최상위 리워드 TY-GA 파트너스. TY 1인 GA파트너스로 하루 1시간, 언제 어디서든 시작하세요.",
  openGraph: {
    title: "TY파트너스 공식인증센터",
    description: "업계 최상위 리워드 TY-GA 파트너스. TY 1인 GA파트너스로 하루 1시간, 언제 어디서든 시작하세요.",
    siteName: "TY파트너스 공식인증센터",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/images/og.jpg",
        width: 1024,
        height: 537,
        alt: "TY 1인 GA 파트너스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TY파트너스 공식인증센터",
    description: "업계 최상위 리워드 TY-GA 파트너스. TY 1인 GA파트너스로 하루 1시간, 언제 어디서든 시작하세요.",
    images: ["/images/og.jpg"],
  },
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
      <body className="min-h-full pb-28 md:pb-8">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
          <SiteWidgets />
        </AuthProvider>
      </body>
    </html>
  );
}
