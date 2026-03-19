'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Hash, AlertTriangle, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SUBJECT_LABELS } from '@/types/kice'
import type { AnalyticsData } from '@/lib/kice-analytics'

interface AnalyticsClientProps {
  data: AnalyticsData
}

function HeatmapCell({ count, max }: { count: number; max: number }) {
  if (count === 0) {
    return <div className="w-8 h-8 rounded bg-muted/30 flex items-center justify-center text-[10px] text-muted-foreground">-</div>
  }
  const intensity = max > 0 ? count / max : 0
  const bg =
    intensity > 0.7 ? 'bg-red-500 text-white' :
    intensity > 0.4 ? 'bg-amber-400 text-amber-900' :
    'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300'

  return (
    <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-medium ${bg}`}>
      {count}
    </div>
  )
}

export default function AnalyticsClient({ data }: AnalyticsClientProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  const maxCount = useMemo(() => {
    let max = 0
    for (const sf of data.subjectFrequencies) {
      for (const c of Object.values(sf.yearCounts)) {
        if (c > max) max = c
      }
    }
    return max
  }, [data.subjectFrequencies])

  const filteredKeywords = useMemo(() => {
    if (!selectedSubject) return data.topKeywords
    return data.topKeywords.filter((kw) => kw.subjects.includes(selectedSubject))
  }, [data.topKeywords, selectedSubject])

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* 탭 */}
      <div className="flex border-b border-border">
        <Link
          href="/kice?tab=by-year"
          className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent"
        >
          연도별 기출
        </Link>
        <Link
          href="/kice?tab=by-area"
          className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent"
        >
          영역별 기출
        </Link>
        <span className="px-4 py-2.5 text-sm font-semibold border-b-2 border-primary text-primary">
          빈도분석
        </span>
        <Link
          href="/kice?tab=search"
          className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent"
        >
          키워드 검색
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">출제 경향 분석</h1>
        <p className="text-muted-foreground text-sm">
          {data.allYears[0]}~{data.allYears[data.allYears.length - 1]}학년도 기출 데이터 기반
        </p>
      </div>

      {/* ─── Subject Frequency Heatmap ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            과목별 출제 빈도 히트맵
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="text-xs" role="table" aria-label="과목별 연도별 출제 빈도">
              <thead>
                <tr>
                  <th className="text-left pr-2 pb-2 font-medium text-muted-foreground sticky left-0 bg-card z-10">과목</th>
                  {data.allYears.map((y) => (
                    <th key={y} className="pb-2 px-0.5 font-medium text-muted-foreground text-center w-8">
                      {String(y).slice(2)}
                    </th>
                  ))}
                  <th className="pb-2 pl-2 font-medium text-muted-foreground text-center">합계</th>
                </tr>
              </thead>
              <tbody>
                {data.subjectFrequencies.map((sf) => (
                  <tr key={sf.subject}>
                    <td className="pr-2 py-0.5 font-medium whitespace-nowrap sticky left-0 bg-card z-10">
                      <button
                        type="button"
                        onClick={() => setSelectedSubject(selectedSubject === sf.subject ? null : sf.subject)}
                        className={`text-left hover:text-primary transition-colors ${
                          selectedSubject === sf.subject ? 'text-primary font-bold' : ''
                        }`}
                      >
                        {SUBJECT_LABELS[sf.subject] ?? sf.subject}
                      </button>
                    </td>
                    {data.allYears.map((y) => (
                      <td key={y} className="px-0.5 py-0.5">
                        <HeatmapCell count={sf.yearCounts[y] ?? 0} max={maxCount} />
                      </td>
                    ))}
                    <td className="pl-2 text-center font-bold">{sf.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Top Keywords ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Hash className="h-4 w-4" />
              출제 빈도 TOP 키워드
              {selectedSubject && (
                <Badge variant="secondary" className="text-xs">
                  {SUBJECT_LABELS[selectedSubject] ?? selectedSubject}
                  <button
                    onClick={() => setSelectedSubject(null)}
                    className="ml-1 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {filteredKeywords.map((kw, i) => {
              const barWidth = data.topKeywords[0]
                ? Math.round((kw.count / data.topKeywords[0].count) * 100)
                : 0
              return (
                <div key={kw.keyword} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{kw.keyword}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{kw.count}회</span>
                      {kw.recentStreak >= 3 && (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-[10px]">
                          {kw.recentStreak}년 연속
                        </Badge>
                      )}
                    </div>
                    <div className="h-1.5 bg-muted rounded-full mt-0.5 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Consecutive Streak Keywords ─── */}
      {data.recentStreakKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-red-500" />
              연속 출제 키워드 (3년 이상)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.recentStreakKeywords.map((kw) => (
                <div
                  key={kw.keyword}
                  className="rounded-lg border border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-950/20 px-3 py-1.5"
                >
                  <div className="text-sm font-medium">{kw.keyword}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {kw.recentStreak}년 연속 · {kw.count}회 출제 · {kw.subjects.map((s) => SUBJECT_LABELS[s] ?? s).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Long-Absent Keywords ─── */}
      {data.neverTestedKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              장기 미출제 키워드 (5년 이상)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {data.neverTestedKeywords.map((kw) => (
                <Badge key={kw} variant="outline" className="text-xs">
                  {kw}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              오래 출제되지 않은 키워드는 재출제 가능성이 있습니다. 복습 우선순위에 참고하세요.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ─── Year-by-Year Summaries ─── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">연도별 시험 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="연도별 시험 요약">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-2 font-medium text-muted-foreground">연도</th>
                  <th className="text-left py-2 pr-2 font-medium text-muted-foreground">시험</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">문항</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">서술</th>
                  <th className="text-center py-2 px-2 font-medium text-muted-foreground">논술</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">주요 과목</th>
                </tr>
              </thead>
              <tbody>
                {data.yearSummaries.map((ys) => {
                  const topSubjects = Object.entries(ys.subjectDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                  return (
                    <tr key={`${ys.year}-${ys.session}`} className="border-b border-border/50">
                      <td className="py-2 pr-2 font-medium">{ys.year}</td>
                      <td className="py-2 pr-2">{ys.session}</td>
                      <td className="py-2 px-2 text-center">{ys.questionCount}</td>
                      <td className="py-2 px-2 text-center">{ys.typeDistribution['fill_in'] ?? 0}</td>
                      <td className="py-2 px-2 text-center">{ys.typeDistribution['descriptive'] ?? 0}</td>
                      <td className="py-2">
                        <div className="flex gap-1 flex-wrap">
                          {topSubjects.map(([subj, count]) => (
                            <Badge key={subj} variant="ghost" className="text-[10px]">
                              {SUBJECT_LABELS[subj] ?? subj}({count})
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
