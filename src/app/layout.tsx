import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { ConditionalReviewPanel } from "@/components/layout/ConditionalReviewPanel";
import { StudySessionTracker } from "@/components/StudySessionTracker";
import { SyncManager } from "@/components/SyncManager";
import { BetaFeedbackWidget } from "@/components/BetaFeedbackWidget";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://special-education-web.vercel.app"),
  title: {
    default: "특수교육 공부방",
    template: "%s | 특수교육 공부방",
  },
  description: "특수교육 임용시험 대비 학습 플랫폼 — 퀴즈, 기출분석, 오답노트, 플래시카드",
  manifest: "/manifest.json",
  openGraph: {
    title: "특수교육 공부방",
    description: "특수교육 임용시험 대비 학습 플랫폼 — 퀴즈, 기출분석, 오답노트, 플래시카드",
    type: "website",
    locale: "ko_KR",
    siteName: "특수교육 공부방",
  },
  twitter: {
    card: "summary",
    title: "특수교육 공부방",
    description: "특수교육 임용시험 대비 학습 플랫폼",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "특수교육 공부방",
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
          <main className="min-h-screen pb-[calc(4.25rem+2.5rem+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </main>
          <Footer />
          <BottomTabBar />
          <ConditionalReviewPanel />
          <StudySessionTracker />
          <SyncManager />
          <BetaFeedbackWidget />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
