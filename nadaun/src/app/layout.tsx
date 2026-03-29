import type { Metadata } from 'next'
import { GlobalHeader } from '@/components/layout/global-header'
import './globals.css'

export const metadata: Metadata = {
  title: '나다운 — IEP 계획 보조도구',
  description:
    '기본교육과정 기반 IEP 연간·주차 계획을 AI가 초안 작성하고, 교사가 수정하여 내보냅니다.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <GlobalHeader />
        {children}
      </body>
    </html>
  )
}
