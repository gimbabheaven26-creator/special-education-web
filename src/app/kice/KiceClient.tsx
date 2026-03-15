'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { Search, FileText, Clock, Award, GitFork, Sparkles, Play, BarChart3 } from 'lucide-react'
import { QuestionCard } from '@/components/kice/QuestionCard'
import { Button } from '@/components/ui/button'
import type { KiceExam, ExamEntry } from '@/types/kice'

interface KiceClientProps {
  entries: ExamEntry[]
  exam: KiceExam | null
  originalExam: KiceExam | null
  selectedYear: number
  selectedSession: string
}

type SessionGroup = {
  base: string
  original: ExamEntry | null
  isomorphic: ExamEntry | null
  predicted: ExamEntry | null
}

function KiceClientInner({ entries, exam, originalExam, selectedYear, selectedSession }: KiceClientProps) {
  const router = useRouter()
  const [keywordFilter, setKeywordFilter] = useState('')
  const [compareMode, setCompareMode] = useState(false)

  const isIsomorphic = selectedSession.includes('동형')
  const isPredicted = selectedSession.includes('예상')

  // Group entries by year
  const yearGroups = useMemo(() => {
    const groups: Record<number, ExamEntry[]> = {}
    for (const entry of entries) {
      const list = groups[entry.year] ?? []
      list.push(entry)
      groups[entry.year] = list
    }
    return groups
  }, [entries])

  const years = Object.keys(yearGroups).map(Number).sort((a, b) => b - a)

  // Group sessions by base name (전공A, 전공B)
  const sessionGroups = useMemo(() => {
    const sessions = yearGroups[selectedYear] ?? []
    const groups: Record<string, SessionGroup> = {}

    for (const entry of sessions) {
      const base = entry.session.replace('-동형', '').replace('-예상', '')
      if (!groups[base]) {
        groups[base] = { base, original: null, isomorphic: null, predicted: null }
      }
      if (entry.isIsomorphic) {
        groups[base].isomorphic = entry
      } else if (entry.isPredicted) {
        groups[base].predicted = entry
      } else {
        groups[base].original = entry
      }
    }

    return Object.values(groups)
  }, [yearGroups, selectedYear])

  // Filter questions by keyword
  const filteredQuestions = useMemo(() => {
    if (!exam) return []
    if (!keywordFilter.trim()) return exam.questions

    const lower = keywordFilter.toLowerCase()
    return exam.questions.filter(q =>
      q.keywords.some(kw => kw.toLowerCase().includes(lower)) ||
      q.subjects.some(s => s.toLowerCase().includes(lower)) ||
      q.context.toLowerCase().includes(lower)
    )
  }, [exam, keywordFilter])

  function handleSessionChange(session: string) {
    setCompareMode(false)
    router.push(`/kice?year=${selectedYear}&session=${encodeURIComponent(session)}`)
  }

  function handleYearChange(year: number) {
    const firstSession = yearGroups[year]?.[0]?.session ?? '전공A'
    setCompareMode(false)
    router.push(`/kice?year=${year}&session=${encodeURIComponent(firstSession)}`)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">KICE 기출 뷰어</h1>
        <p className="text-sm text-muted-foreground mt-1">
          특수교육 임용시험 기출문제 · 동형문제 · 모범답안
        </p>
      </div>

      {/* 연도 선택 */}
      <div className="flex gap-1.5 flex-wrap">
        {years.map(year => (
          <button
            key={year}
            onClick={() => handleYearChange(year)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              year === selectedYear
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* 세션 그룹 선택 — 원본↔동형↔예상 관계 표시 */}
      <div className="space-y-2">
        {sessionGroups.map(group => (
          <div key={group.base} className="flex items-center gap-1.5 flex-wrap">
            {/* 원본 */}
            {group.original && (
              <button
                onClick={() => handleSessionChange(group.original!.session)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  group.original.session === selectedSession
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                }`}
              >
                <FileText className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                {group.base}
              </button>
            )}

            {/* 동형 연결선 */}
            {group.isomorphic && (
              <>
                <span className="text-muted-foreground text-xs">→</span>
                <button
                  onClick={() => handleSessionChange(group.isomorphic!.session)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    group.isomorphic.session === selectedSession
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                  }`}
                >
                  <GitFork className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                  동형
                </button>
              </>
            )}

            {/* 예상 연결선 */}
            {group.predicted && (
              <>
                {(group.original || group.isomorphic) && (
                  <span className="text-muted-foreground text-xs">→</span>
                )}
                <button
                  onClick={() => handleSessionChange(group.predicted!.session)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    group.predicted.session === selectedSession
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50'
                  }`}
                >
                  <Sparkles className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                  예상
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 동형 비교 모드 토글 */}
      {isIsomorphic && originalExam && (
        <button
          onClick={() => setCompareMode(prev => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            compareMode
              ? 'bg-amber-600 text-white'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
          }`}
        >
          <GitFork className="h-3.5 w-3.5" />
          {compareMode ? '비교 모드 끄기' : '원본과 비교'}
        </button>
      )}

      {/* 시험 메타 정보 */}
      {exam && (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{exam.exam.total_questions}문항</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>{exam.exam.total_points}점</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{exam.exam.duration_minutes}분</span>
            </div>
            <div className="text-muted-foreground">
              {Object.entries(exam.exam.question_types).map(([type, info]) =>
                `${type === 'fill_in' ? '서술' : '논술'} ${info.count}문항(각 ${info.points_each}점)`
              ).join(' / ')}
            </div>
          </div>
          {(isIsomorphic || isPredicted) && (
            <div className={`mt-2 text-xs font-medium ${
              isIsomorphic ? 'text-amber-600 dark:text-amber-400' : 'text-purple-600 dark:text-purple-400'
            }`}>
              {isIsomorphic && '동형문제: 원본과 동일한 구조·난이도, 다른 구체적 내용'}
              {isPredicted && '예상문제: 3개년 출제 경향 분석 기반 예측'}
            </div>
          )}
        </div>
      )}

      {/* 모의고사 + 분석 */}
      {exam && (
        <div className="flex gap-3">
          <Button
            render={
              <Link href={`/kice/exam?year=${selectedYear}&session=${encodeURIComponent(selectedSession)}`} />
            }
            size="lg"
            className="flex-1 min-h-[48px]"
          >
            <Play className="h-5 w-5 mr-2" />
            모의고사 모드
          </Button>
          <Button
            render={<Link href="/kice/analytics" />}
            variant="outline"
            size="lg"
            className="flex-1 min-h-[48px]"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            출제 경향 분석
          </Button>
        </div>
      )}

      {/* 키워드 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="키워드, 과목, 지문 내용으로 검색..."
          value={keywordFilter}
          onChange={e => setKeywordFilter(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {keywordFilter && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {filteredQuestions.length}문항
          </span>
        )}
      </div>

      {/* 문항 리스트 */}
      {!exam ? (
        <div className="text-center py-12 text-muted-foreground">
          선택한 시험을 찾을 수 없습니다.
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          검색 결과가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map(q => {
            const originalQ = compareMode && originalExam
              ? originalExam.questions.find(oq => oq.number === q.number)
              : null

            return (
              <div key={q.number}>
                {compareMode && originalQ && (
                  <div className="mb-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 ring-1 ring-blue-200 dark:ring-blue-800/30 p-3">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      원본 Q{originalQ.number}
                    </div>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap line-clamp-4">
                      {originalQ.context}
                    </p>
                  </div>
                )}
                <QuestionCard question={q} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function KiceClient(props: KiceClientProps) {
  return (
    <Suspense>
      <KiceClientInner {...props} />
    </Suspense>
  )
}
