import type { Metadata } from 'next'
import { getAvailableExams, getExam } from '@/lib/kice/kice'

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '기출문제 분석',
  description: '특수교육 임용시험 기출문제 연도별 분석 및 모의고사 풀이.',
}
import { computeAnalytics } from '@/lib/kice/kice-analytics'
import KiceClient from './KiceClient'
import AnalyticsClient from './analytics/AnalyticsClient'

interface PageProps {
  searchParams: Promise<{ year?: string; session?: string; tab?: string }>
}

export default async function KicePage({ searchParams }: PageProps) {
  const params = await searchParams
  const tab = params.tab ?? 'by-year'

  if (tab === 'analytics') {
    const data = computeAnalytics()
    return <AnalyticsClient data={data} />
  }

  const entries = getAvailableExams()
  const selectedYear = params.year ? Number(params.year) : (entries[0]?.year ?? 2026)
  const selectedSession = params.session ?? entries.find(e => e.year === selectedYear)?.session ?? '전공A'
  const exam = getExam(selectedYear, selectedSession)
  const isIsomorphic = selectedSession.includes('동형')
  const originalSession = isIsomorphic ? selectedSession.replace('-동형', '') : null
  const originalExam = originalSession ? getExam(selectedYear, originalSession) : null

  return (
    <KiceClient
      entries={entries}
      exam={exam}
      originalExam={originalExam}
      selectedYear={selectedYear}
      selectedSession={selectedSession}
    />
  )
}
