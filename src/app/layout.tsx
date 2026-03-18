import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { ConditionalReviewPanel } from "@/components/layout/ConditionalReviewPanel";
import { StudySessionTracker } from "@/components/StudySessionTracker";
import { SyncManager } from "@/components/SyncManager";
import { isAdmin } from "@/lib/profile";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "특수교육 공부방",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminUser = await isAdmin().catch(() => false);
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <Header showAdminNav={adminUser} />
          <main className="min-h-screen pb-20 md:pb-0">
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
