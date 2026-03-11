import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ReviewPanel } from "@/components/ReviewPanel";

export const metadata: Metadata = {
  title: "특수교육 공부방",
  description: "특수교육 학습을 위한 웹사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <ReviewPanel />
        </ThemeProvider>
      </body>
    </html>
  );
}
