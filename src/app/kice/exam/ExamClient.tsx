'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock, Flag, ArrowLeft, Play, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DialogueBlock } from '@/components/kice/DialogueBlock'
import { SubItemsBlock } from '@/components/kice/SubItemsBlock'
import { SUBJECT_LABELS } from '@/types/kice'
import type { KiceExam, KiceQuestion, ExamEntry } from '@/types/kice'
import ExamResultScreen from './ExamResultScreen'

type ExamPhase = 'setup' | 'exam' | 'result'

interface UserAnswer {
  blanks: Record<string, string>
  descriptive: string
  flagged: boolean
}

function createEmptyAnswer(question: KiceQuestion): UserAnswer {
  const blanks: Record<string, string> = {}
  if (question.blanks) {
    for (const key of Object.keys(question.blanks)) {
      blanks[key] = ''
    }
  }
  return { blanks, descriptive: '', flagged: false }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface ExamClientProps {
  exam: KiceExam
  entries: ExamEntry[]
  selectedYear: number
  selectedSession: string
}

export default function ExamClient({ exam, entries, selectedYear, selectedSession }: ExamClientProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<ExamPhase>('setup')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<UserAnswer[]>(() =>
    exam.questions.map(createEmptyAnswer),
  )
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const questions = exam.questions
  const totalTime = exam.exam.duration_minutes * 60
  const question = questions[currentIndex]
  const answer = answers[currentIndex]

  // Timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerActive])

  // Focus textarea on question change
  useEffect(() => {
    if (phase === 'exam') {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [currentIndex, phase])

  const updateAnswer = useCallback(
    (index: number, updater: (prev: UserAnswer) => UserAnswer) => {
      setAnswers((prev) =>
        prev.map((a, i) => (i === index ? updater(a) : a)),
      )
    },
    [],
  )

  const handleBlankChange = (key: string, value: string) => {
    updateAnswer(currentIndex, (prev) => ({
      ...prev,
      blanks: { ...prev.blanks, [key]: value },
    }))
  }

  const handleDescriptiveChange = (value: string) => {
    updateAnswer(currentIndex, (prev) => ({
      ...prev,
      descriptive: value,
    }))
  }

  const toggleFlag = () => {
    updateAnswer(currentIndex, (prev) => ({
      ...prev,
      flagged: !prev.flagged,
    }))
  }

  const startExam = () => {
    setPhase('exam')
    setTimerActive(true)
  }

  const submitExam = () => {
    setTimerActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('result')
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index)
    }
  }

  // Year/session selection for setup
  const handleYearChange = (year: string) => {
    const session = entries.find((e) => e.year === Number(year))?.session ?? '전공A'
    router.push(`/kice/exam?year=${year}&session=${encodeURIComponent(session)}`)
  }

  const handleSessionChange = (session: string) => {
    router.push(`/kice/exam?year=${selectedYear}&session=${encodeURIComponent(session)}`)
  }

  const sessionsForYear = entries.filter((e) => e.year === selectedYear)
  const years = Array.from(new Set(entries.map((e) => e.year))).sort((a, b) => b - a)

  const answeredCount = answers.filter((a) => {
    const hasBlanks = Object.values(a.blanks).some((v) => v.trim().length > 0)
    const hasDesc = a.descriptive.trim().length > 0
    return hasBlanks || hasDesc
  }).length

  const flaggedCount = answers.filter((a) => a.flagged).length

  // ─── Setup Phase ───
  if (phase === 'setup') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="space-y-1">
          <Link
            href="/kice"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            기출 목록
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">모의고사 모드</h1>
          <p className="text-muted-foreground text-sm">
            실제 시험처럼 문제를 풀고 자기 채점하세요.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* 시험 선택 */}
            <div className="flex gap-3">
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="min-h-[44px] rounded-lg border border-border bg-background px-3 text-sm flex-1"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}학년도</option>
                ))}
              </select>
              <select
                value={selectedSession}
                onChange={(e) => handleSessionChange(e.target.value)}
                className="min-h-[44px] rounded-lg border border-border bg-background px-3 text-sm flex-1"
              >
                {sessionsForYear.map((e) => (
                  <option key={e.session} value={e.session}>{e.session}</option>
                ))}
              </select>
            </div>

            {/* 시험 정보 */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">{exam.exam.title}</p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>문항 {exam.exam.total_questions}개</span>
                <span>총 {exam.exam.total_points}점</span>
                <span>{exam.exam.duration_minutes}분</span>
              </div>
              <div className="flex gap-2 mt-1">
                {Object.entries(exam.exam.question_types).map(([type, info]) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type === 'fill_in' ? '서술형' : '논술형'} {info.count}문항 ({info.points_each}점)
                  </Badge>
                ))}
              </div>
            </div>

            {/* 안내 */}
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 모범답안은 제출 후에 공개됩니다.</p>
              <p>• 문제 간 자유롭게 이동할 수 있습니다.</p>
              <p>• 깃발로 나중에 확인할 문제를 표시하세요.</p>
              <p>• 타이머는 참고용이며 자동 제출되지 않습니다.</p>
            </div>

            <Button
              onClick={startExam}
              size="lg"
              className="w-full min-h-[48px] text-base"
            >
              <Play className="h-5 w-5 mr-2" />
              시험 시작
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  // ─── Result Phase ───
  if (phase === 'result') {
    return (
      <ExamResultScreen
        exam={exam}
        answers={answers}
        elapsedSeconds={elapsedSeconds}
      />
    )
  }

  // ─── Exam Phase ───
  if (!question || !answer) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">모의고사</h1>
        <p className="text-muted-foreground text-sm">
          표시할 문제가 없습니다.
        </p>
        <Link
          href="/kice"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          기출 목록으로 돌아가기
        </Link>
      </main>
    )
  }

  const remainingTime = Math.max(0, totalTime - elapsedSeconds)
  const isOvertime = elapsedSeconds > totalTime
  const scenarioDialogue =
    typeof question.scenario === 'object' && question.scenario?.dialogue
      ? question.scenario.dialogue
      : null

  return (
    <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
      {/* Top bar: timer + progress */}
      <div className="flex items-center justify-between gap-2 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 border-b border-border -mx-4 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1 text-sm font-mono ${
              isOvertime ? 'text-red-500' : remainingTime < 600 ? 'text-amber-500' : 'text-muted-foreground'
            }`}
          >
            <Clock className="h-4 w-4" />
            {isOvertime ? `+${formatTime(elapsedSeconds - totalTime)}` : formatTime(remainingTime)}
          </div>
          <span className="text-xs text-muted-foreground">
            {answeredCount}/{questions.length}문항
          </span>
          {flaggedCount > 0 && (
            <span className="text-xs text-amber-500 flex items-center gap-0.5">
              <Flag className="h-3 w-3" />
              {flaggedCount}
            </span>
          )}
        </div>
        <Button
          onClick={submitExam}
          size="sm"
          className="min-h-[36px]"
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          제출
        </Button>
      </div>

      {/* Question navigator */}
      <div className="flex gap-1 flex-wrap">
        {questions.map((q, i) => {
          const a = answers[i]
          const hasAnswer =
            Object.values(a.blanks).some((v) => v.trim().length > 0) ||
            a.descriptive.trim().length > 0
          return (
            <button
              key={q.number}
              onClick={() => goToQuestion(i)}
              className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                i === currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : hasAnswer
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
              } ${a.flagged ? 'ring-2 ring-amber-400' : ''}`}
            >
              {q.number}
            </button>
          )
        })}
      </div>

      {/* Question content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {question.number}
              </span>
              <Badge variant="outline" className="text-xs">
                {question.type === 'fill_in' ? '서술형' : '논술형'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {question.points}점
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-wrap">
                {question.subjects.map((s) => (
                  <Badge key={s} variant="ghost" className="text-xs">
                    {SUBJECT_LABELS[s] ?? s}
                  </Badge>
                ))}
              </div>
              <button
                onClick={toggleFlag}
                className={`p-1.5 rounded-md transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
                  answer.flagged
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title="나중에 확인"
              >
                <Flag className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 문제 지문 */}
          <p className="text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">
            {question.context}
          </p>

          {/* 시나리오 */}
          {typeof question.scenario === 'object' && question.scenario?.details && (
            <div className="rounded-lg bg-muted/30 p-3 text-sm space-y-1">
              {question.scenario.title && (
                <div className="font-semibold text-xs text-muted-foreground mb-2">
                  {question.scenario.title}
                </div>
              )}
              {Object.entries(question.scenario.details).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="font-medium text-muted-foreground shrink-0">{key}:</span>
                  <span className="text-foreground/90">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* 대화 */}
          {question.dialogue && <DialogueBlock lines={question.dialogue} />}
          {scenarioDialogue && <DialogueBlock lines={scenarioDialogue} />}

          {/* 하위 항목 */}
          {question.sub_items && <SubItemsBlock items={question.sub_items} />}

          {/* 참고 */}
          {question.note && (
            <div className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2 italic">
              {question.note}
            </div>
          )}

          {/* 작성 방법 (서술형) */}
          {question.tasks && question.tasks.length > 0 && (
            <div className="rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/30 p-3">
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5">
                작성 방법
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                {question.tasks.map((task, i) => (
                  <li key={i} className="whitespace-pre-wrap">{task}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ─── Answer Input Area ─── */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground">답안 작성</div>

            {/* Fill-in blanks */}
            {question.blanks && Object.keys(question.blanks).length > 0 && (
              <div className="space-y-2">
                {Object.entries(question.blanks).map(([key, info]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="text-sm font-medium text-muted-foreground shrink-0 mt-2 w-8">
                      {key}
                    </span>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={answer.blanks[key] ?? ''}
                        onChange={(e) => handleBlankChange(key, e.target.value)}
                        placeholder={info.description}
                        className="w-full min-h-[44px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Descriptive answer */}
            {question.type === 'descriptive' && (
              <textarea
                ref={textareaRef}
                value={answer.descriptive}
                onChange={(e) => handleDescriptiveChange(e.target.value)}
                placeholder="답안을 작성하세요..."
                className="w-full min-h-[200px] resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm leading-relaxed focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-2 pb-6">
        <Button
          onClick={() => goToQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
          variant="outline"
          className="min-h-[44px]"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          이전
        </Button>

        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {questions.length}
        </span>

        {currentIndex < questions.length - 1 ? (
          <Button
            onClick={() => goToQuestion(currentIndex + 1)}
            variant="outline"
            className="min-h-[44px]"
          >
            다음
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={submitExam}
            className="min-h-[44px]"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            제출
          </Button>
        )}
      </div>
    </main>
  )
}
