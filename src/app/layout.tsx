import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { ConditionalReviewPanel } from "@/components/layout/ConditionalReviewPanel";
import { StudySessionTracker } from "@/components/StudySessionTracker";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "특수교육 공부방",
  description: "특수교육 임용시험 대비 학습 플랫폼",
  openGraph: {
    title: "특수교육 공부방",
    description: "특수교육 임용시험 대비 학습 플랫폼",
    type: "website",
    locale: "ko_KR",
    siteName: "특수교육 공부방",
  },
  twitter: {
    card: "summary",
    title: "특수교육 공부방",
    description: "특수교육 임용시험 대비 학습 플랫폼",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <Header />
          <main className="min-h-screen pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
          <BottomTabBar />
          <ConditionalReviewPanel />
          <StudySessionTracker />
        </ThemeProvider>
      </body>
    </html>
  );
}
