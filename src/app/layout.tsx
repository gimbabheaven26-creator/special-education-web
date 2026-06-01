import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { LayoutProviders } from "@/components/layout/LayoutProviders";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#101214",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_IEUMJIN_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://ieumjin.vercel.app"),
  title: {
    default: "이음진",
    template: "%s | 이음진",
  },
  description: "용어에서 개념, 기출, AI 동형문제까지 이어지는 특수교육 임용 수험지",
  manifest: "/manifest.json",
  openGraph: {
    title: "이음진",
    description: "용어에서 개념, 기출, AI 동형문제까지 이어지는 특수교육 임용 수험지",
    type: "website",
    locale: "ko_KR",
    siteName: "이음진",
  },
  twitter: {
    card: "summary",
    title: "이음진",
    description: "용어에서 기출까지 이어지는 특수교육 임용 수험지",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "이음진",
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
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased">
        <LayoutProviders>
          <main className="min-h-screen pb-[calc(4.25rem+2.5rem+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </main>
          <Footer />
        </LayoutProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
