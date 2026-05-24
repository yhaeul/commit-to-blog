import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import NavBar from "@/components/shared/NavBar";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "commit-to-blog",
  description: "GitHub 커밋 이력을 AI가 분석해 자동으로 개발 블로그 초안을 생성하는 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NavBar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
