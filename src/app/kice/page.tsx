import { getAvailableExams, getExam } from '@/lib/kice'
import { getSubjects, getAllWorksheetTopics } from '@/lib/db'
import KiceClient from './KiceClient'
import KiceByArea from './KiceByArea'

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

  const entries = getAvailableExams()

  const selectedYear = params.year ? Number(params.year) : (entries[0]?.year ?? 2026)
  const selectedSession = params.session ?? entries.find(e => e.year === selectedYear)?.session ?? '전공A'

  const exam = getExam(selectedYear, selectedSession)

  // If viewing 동형, also load the original for comparison
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
