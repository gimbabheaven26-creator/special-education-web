import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { ConditionalReviewPanel } from "@/components/layout/ConditionalReviewPanel";
import { StudySessionTracker } from "@/components/StudySessionTracker";
import { SyncManager } from "@/components/SyncManager";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: "특수교육 공부방",
  description: "특수교육 임용시험 대비 학습 플랫폼",
  manifest: "/manifest.json",
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
        </ThemeProvider>
      </body>
    </html>
  );
}
