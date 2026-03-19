import { getAvailableExams, getExam } from '@/lib/kice'
import { getSubjects, getAllWorksheetTopics } from '@/lib/db'
import { computeAnalytics } from '@/lib/kice-analytics'
import KiceClient from './KiceClient'
import KiceByArea from './KiceByArea'
import KiceSearch, { type KiceSearchItem } from './KiceSearch'
import AnalyticsClient from './analytics/AnalyticsClient'

interface PageProps {
  searchParams: Promise<{ year?: string; session?: string; tab?: string }>
}

export default async function KicePage({ searchParams }: PageProps) {
  const params = await searchParams
  const tab = params.tab ?? 'by-year'

  if (tab === 'by-area') {
    const subjects = await getSubjects()
    const topics = await getAllWorksheetTopics()
    return <KiceByArea subjects={subjects} topics={topics} />
  }

  if (tab === 'analytics') {
    const data = computeAnalytics()
    return <AnalyticsClient data={data} />
  }

  if (tab === 'search') {
    const entries = getAvailableExams()
    const items: KiceSearchItem[] = []
    for (const entry of entries) {
      const exam = getExam(entry.year, entry.session)
      if (exam) {
        for (const q of exam.questions) {
          items.push({
            year: entry.year,
            session: entry.session,
            number: q.number,
            points: q.points,
            context: q.context,
            keywords: q.keywords,
            subjects: q.subjects,
          })
        }
      }
    }
    return <KiceSearch items={items} />
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
