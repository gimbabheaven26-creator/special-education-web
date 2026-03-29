import { getAvailableExams, getDefaultExamEntry, getExam } from '@/lib/kice/kice'
import ExamClient from './ExamClient'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ year?: string; session?: string }>
}

export default async function ExamPage({ searchParams }: PageProps) {
  const params = await searchParams
  const entries = getAvailableExams()

  const defaultEntry = getDefaultExamEntry(entries)
  const selectedYear = params.year ? Number(params.year) : (defaultEntry?.year ?? 2026)
  const selectedSession = params.session ?? entries.find(e => e.year === selectedYear && !e.isPredicted && !e.isIsomorphic)?.session ?? entries.find(e => e.year === selectedYear)?.session ?? '전공A'

  const exam = getExam(selectedYear, selectedSession)

  if (!exam) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold">모의고사</h1>
        <p className="text-muted-foreground">시험 데이터를 찾을 수 없습니다.</p>
        <Link href="/kice" className="text-primary underline text-sm">
          기출 목록으로 돌아가기
        </Link>
      </main>
    )
  }

  return (
    <ExamClient
      exam={exam}
      entries={entries}
      selectedYear={selectedYear}
      selectedSession={selectedSession}
    />
  )
}
