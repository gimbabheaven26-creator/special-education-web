'use client'

import { useMemo, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, Target, Flag, CheckCircle2, XCircle, History } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SUBJECT_LABELS } from '@/types/kice'
import type { KiceExam, KiceQuestion } from '@/types/kice'
import { checkBlank } from '@/lib/check-blank'
import { getScoreFeedback, getScoreBarClass } from '@/lib/score-feedback'

interface UserAnswer {
  blanks: Record<string, string>
  descriptive: string
  flagged: boolean
}

interface ExamResultScreenProps {
  exam: KiceExam
  answers: UserAnswer[]
  elapsedSeconds: number
}

interface ExamHistoryEntry {
  year: number
  session: string
  autoScore: number
  autoMax: number
  elapsedSeconds: number
  date: string
}

const HISTORY_KEY = 'kice-exam-history'

interface BlankResult {
  key: string
  description: string
  expected: string
  userAnswer: string
  isCorrect: boolean
}

interface QuestionResult {
  question: KiceQuestion
  answer: UserAnswer
  blankResults: BlankResult[]
  autoScore: number
  maxScore: number
  isAutoGradable: boolean
}


function gradeQuestion(question: KiceQuestion, answer: UserAnswer): QuestionResult {
  const blankResults: BlankResult[] = []
  let autoScore = 0
  const maxScore = question.points
  const isAutoGradable = question.type === 'fill_in' && !!question.blanks

  if (question.blanks) {
    const blankEntries = Object.entries(question.blanks)
    const pointsPerBlank = blankEntries.length > 0
      ? question.points / blankEntries.length
      : 0

    for (const [key, info] of blankEntries) {
      const userAnswer = answer.blanks[key] ?? ''
      const isCorrect = checkBlank(info.answer, userAnswer)
      blankResults.push({
        key,
        description: info.description,
        expected: info.answer,
        userAnswer,
        isCorrect,
      })
      if (isCorrect) autoScore += pointsPerBlank
    }
  }

  return { question, answer, blankResults, autoScore, maxScore, isAutoGradable }
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}시간 ${m}분 ${s}초`
  return `${m}분 ${s}초`
}

export default function ExamResultScreen({ exam, answers, elapsedSeconds }: ExamResultScreenProps) {
  const results = useMemo(
    () => exam.questions.map((q, i) => gradeQuestion(q, answers[i])),
    [exam.questions, answers],
  )

  const stats = useMemo(() => {
    const autoGradable = results.filter((r) => r.isAutoGradable)
    const autoScore = autoGradable.reduce((sum, r) => sum + r.autoScore, 0)
    const autoMax = autoGradable.reduce((sum, r) => sum + r.maxScore, 0)
    const descriptiveCount = results.filter((r) => !r.isAutoGradable).length
    const descriptiveMax = results
      .filter((r) => !r.isAutoGradable)
      .reduce((sum, r) => sum + r.maxScore, 0)
    const flaggedCount = results.filter((r) => r.answer.flagged).length
    const answeredCount = results.filter((r) => {
      const hasBlanks = Object.values(r.answer.blanks).some((v) => v.trim().length > 0)
      return hasBlanks || r.answer.descriptive.trim().length > 0
    }).length

    return { autoScore, autoMax, descriptiveCount, descriptiveMax, flaggedCount, answeredCount }
  }, [results])

  const [previousHistory, setPreviousHistory] = useState<ExamHistoryEntry[]>([])

  // Save result to history; load previous entries
  useEffect(() => {
    const entry: ExamHistoryEntry = {
      year: exam.exam.year,
      session: exam.exam.session,
      autoScore: Math.round(stats.autoScore),
      autoMax: stats.autoMax,
      elapsedSeconds,
      date: new Date().toISOString(),
    }
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      const prev: ExamHistoryEntry[] = raw ? JSON.parse(raw) : []
      setPreviousHistory(prev.slice(0, 3))
      const updated = [entry, ...prev].slice(0, 10)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    } catch {
      // ignore storage errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const subjectStats = useMemo(() => {
    const map = new Map<string, { correct: number; total: number; count: number }>()
    for (const r of results) {
      if (!r.isAutoGradable) continue
      for (const subj of r.question.subjects) {
        const prev = map.get(subj) ?? { correct: 0, total: 0, count: 0 }
        map.set(subj, {
          correct: prev.correct + r.autoScore,
          total: prev.total + r.maxScore,
          count: prev.count + 1,
        })
      }
    }
    return Array.from(map.entries())
      .map(([subject, data]) => ({ subject, ...data }))
      .sort((a, b) => (a.correct / a.total) - (b.correct / b.total))
  }, [results])

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">모의고사 결과</h1>
        <p className="text-muted-foreground text-sm">
          {exam.exam.year}학년도 {exam.exam.session}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(stats.autoScore)}<span className="text-sm text-muted-foreground">/{stats.autoMax}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">자동 채점 점수</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              <Clock className="h-5 w-5 text-muted-foreground" />
              {Math.floor(elapsedSeconds / 60)}
              <span className="text-sm text-muted-foreground">분</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">소요 시간</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold">
              {stats.answeredCount}<span className="text-sm text-muted-foreground">/{exam.questions.length}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">응답 문항</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-amber-500">
              {stats.descriptiveCount}
            </div>
            <div className="text-xs text-muted-foreground mt-1">자기 채점 필요</div>
          </CardContent>
        </Card>
      </div>

      {/* Emotional Feedback */}
      {stats.autoMax > 0 && (() => {
        const pct = Math.round((stats.autoScore / stats.autoMax) * 100)
        const fb = getScoreFeedback(pct)
        return (
          <div className={`rounded-lg p-4 text-center ${fb.bgClass}`}>
            <span className="text-2xl">{fb.emoji}</span>
            <p className={`mt-1 font-medium ${fb.colorClass}`}>{fb.message}</p>
          </div>
        )
      })()}

      {/* Time analysis */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">배정 시간</span>
            <span>{exam.exam.duration_minutes}분</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">실제 소요</span>
            <span className={elapsedSeconds > exam.exam.duration_minutes * 60 ? 'text-red-500 font-medium' : ''}>
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">문항당 평균</span>
            <span>{formatTime(Math.round(elapsedSeconds / exam.questions.length))}</span>
          </div>
        </CardContent>
      </Card>

      {/* Subject breakdown (auto-graded only) */}
      {subjectStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">영역별 결과 (자동 채점)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {subjectStats.map(({ subject, correct, total }) => {
              const pct = total > 0 ? Math.round((correct / total) * 100) : 0
              return (
                <div key={subject} className="flex items-center gap-3">
                  <span className="text-sm w-20 shrink-0">{SUBJECT_LABELS[subject] ?? subject}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getScoreBarClass(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">
                    {Math.round(correct)}/{total}점 ({pct}%)
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Per-question results */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">문항별 결과</h2>
        {results.map((r) => (
          <Card key={r.question.number}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {r.question.number}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {r.question.type === 'fill_in' ? '서술형' : '논술형'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {r.question.points}점
                  </Badge>
                  {r.answer.flagged && (
                    <Flag className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </CardTitle>
                {r.isAutoGradable && (
                  <Badge
                    className={
                      r.autoScore === r.maxScore
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : r.autoScore > 0
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }
                  >
                    {Math.round(r.autoScore)}/{r.maxScore}점
                  </Badge>
                )}
                {!r.isAutoGradable && (
                  <Badge variant="outline" className="text-xs text-amber-600">
                    자기 채점 필요
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Blank results */}
              {r.blankResults.length > 0 && (
                <div className="space-y-1.5">
                  {r.blankResults.map((b) => (
                    <div key={b.key} className="flex items-start gap-2 text-sm">
                      <span className="shrink-0 mt-0.5">
                        {b.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-muted-foreground">{b.key}</span>
                        <span className="mx-1.5">:</span>
                        {b.userAnswer ? (
                          <span className={b.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400 line-through'}>
                            {b.userAnswer}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">미응답</span>
                        )}
                        {!b.isCorrect && (
                          <span className="text-green-600 dark:text-green-400 ml-2">
                            → {b.expected}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Descriptive: show user answer + model answer */}
              {r.question.type === 'descriptive' && (
                <div className="space-y-2">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">내 답안</div>
                    <div className="text-sm whitespace-pre-wrap rounded-lg bg-muted/30 p-3 min-h-[60px]">
                      {r.answer.descriptive.trim() || '(미응답)'}
                    </div>
                  </div>
                  {r.question.model_answers && (
                    <div>
                      <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">모범답안</div>
                      <div className="text-sm whitespace-pre-wrap rounded-lg bg-green-50 dark:bg-green-950/30 p-3 space-y-1">
                        {Object.entries(r.question.model_answers).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}: </span>
                            <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.question.blanks && Object.keys(r.question.blanks).length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">정답</div>
                      <div className="text-sm rounded-lg bg-green-50 dark:bg-green-950/30 p-3 space-y-0.5">
                        {Object.entries(r.question.blanks).map(([key, info]) => (
                          <div key={key}>
                            <span className="font-medium">{key}: </span>
                            <span>{info.answer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 이전 성적 */}
      {previousHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              이전 성적
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {previousHistory.map((h, i) => {
              const pct = h.autoMax > 0 ? Math.round((h.autoScore / h.autoMax) * 100) : 0
              const d = new Date(h.date)
              const label = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{h.year}학년도 {h.session}</span>
                    <span className="text-xs text-muted-foreground ml-2">{label}</span>
                  </div>
                  <span className={`font-semibold ${getScoreFeedback(pct).colorClass}`}>
                    {h.autoScore}/{h.autoMax}점 ({pct}%)
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 pb-10">
        <Button
          render={<Link href={`/kice/exam?year=${exam.exam.year}&session=${encodeURIComponent(exam.exam.session)}`} />}
          variant="outline"
          className="flex-1 min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          다시 풀기
        </Button>
        <Button
          render={<Link href="/kice" />}
          className="flex-1 min-h-[44px]"
        >
          <Target className="h-4 w-4 mr-1" />
          기출 목록
        </Button>
      </div>
    </main>
  )
}
