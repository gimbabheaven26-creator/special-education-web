import type { Metadata, Viewport } from 'next'
import { GlobalHeader } from '@/components/layout/global-header'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Toaster } from '@/components/ui/toaster'
import { ServiceWorkerRegistrar } from '@/components/pwa/sw-registrar'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '나다운 — IEP 계획 보조도구',
    template: '%s | 나다운',
  },
  description:
    '기본교육과정 기반 IEP 연간·주차 계획을 AI가 초안 작성하고, 교사가 수정하여 내보냅니다.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '나다운',
  },
  openGraph: {
    title: '나다운 — IEP 계획 보조도구',
    description: '기본교육과정 기반 IEP 계획 보조도구',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#2d8c3c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased pb-16 md:pb-0">
        <GlobalHeader />
        <main className="mx-auto max-w-3xl px-4 py-6">
          {children}
        </main>
        <MobileBottomNav />
        <Toaster />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
