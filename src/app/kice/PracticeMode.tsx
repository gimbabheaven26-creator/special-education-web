'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, X, RotateCcw } from 'lucide-react'
import { QuestionCard } from '@/components/kice/QuestionCard'
import { checkBlank } from '@/lib/quiz/check-blank'
import type { KiceQuestion } from '@/types/kice'
import type { ConceptLink } from '@/lib/kice/keyword-concept-map'

interface PracticeModeProps {
  questions: KiceQuestion[]
  conceptLinksMap: Record<number, ConceptLink[]>
  onExit: () => void
}

interface PracticeAnswer {
  blanks: Record<string, string>
  submitted: boolean
}

function createEmptyAnswer(q: KiceQuestion): PracticeAnswer {
  const blanks: Record<string, string> = {}
  if (q.blanks) {
    for (const key of Object.keys(q.blanks)) {
      blanks[key] = ''
    }
  }
  return { blanks, submitted: false }
}

export default function PracticeMode({ questions, conceptLinksMap, onExit }: PracticeModeProps) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<PracticeAnswer[]>(() =>
    questions.map(createEmptyAnswer),
  )
  const [showResult, setShowResult] = useState(false)

  const question = questions[index]
  const answer = answers[index]
  const hasBlanks = question?.blanks && Object.keys(question.blanks).length > 0

  const updateBlank = useCallback((key: string, value: string) => {
    setAnswers(prev => prev.map((a, i) =>
      i === index ? { ...a, blanks: { ...a.blanks, [key]: value } } : a,
    ))
  }, [index])

  const submitAnswer = useCallback(() => {
    setAnswers(prev => prev.map((a, i) =>
      i === index ? { ...a, submitted: true } : a,
    ))
  }, [index])

  const blankResults = useMemo(() => {
    if (!question?.blanks || !answer?.submitted) return null
    return Object.entries(question.blanks).map(([key, info]) => ({
      key,
      expected: info.answer,
      userAnswer: answer.blanks[key] ?? '',
      isCorrect: checkBlank(info.answer, answer.blanks[key] ?? ''),
    }))
  }, [question, answer])

  const resultSummary = useMemo(() => {
    let totalBlanks = 0
    let correctBlanks = 0
    let submittedCount = 0

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const a = answers[i]
      if (!a.submitted) continue
      submittedCount++
      if (q.blanks) {
        for (const [key, info] of Object.entries(q.blanks)) {
          totalBlanks++
          if (checkBlank(info.answer, a.blanks[key] ?? '')) correctBlanks++
        }
      }
    }

    return { totalBlanks, correctBlanks, submittedCount, total: questions.length }
  }, [questions, answers])

  const hasAnyInput = hasBlanks
    ? Object.values(answer?.blanks ?? {}).some(v => v.trim().length > 0)
    : false

  if (showResult) {
    const pct = resultSummary.totalBlanks > 0
      ? Math.round((resultSummary.correctBlanks / resultSummary.totalBlanks) * 100)
      : 0

    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-5 space-y-3">
          <h3 className="text-lg font-bold text-foreground">연습 결과</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{resultSummary.submittedCount}/{resultSummary.total}</div>
              <div className="text-xs text-muted-foreground mt-0.5">풀이한 문항</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className={`text-2xl font-bold ${pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                {resultSummary.correctBlanks}/{resultSummary.totalBlanks}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">빈칸 정답 ({pct}%)</div>
            </div>
          </div>
          {pct >= 70 && <p className="text-sm text-green-600 font-medium">잘했어요! 핵심 개념을 잘 파악하고 있습니다.</p>}
          {pct >= 40 && pct < 70 && <p className="text-sm text-amber-600 font-medium">조금 더 복습하면 완벽해질 거예요.</p>}
          {pct < 40 && resultSummary.totalBlanks > 0 && <p className="text-sm text-red-500 font-medium">관련 개념을 다시 학습해보세요.</p>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setAnswers(questions.map(createEmptyAnswer))
              setIndex(0)
              setShowResult(false)
            }}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            다시 풀기
          </button>
          <button
            onClick={onExit}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            목록으로
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 상단: 뒤로 + 진행률 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          목록으로
        </button>
        <span className="text-sm font-medium text-muted-foreground">
          {index + 1} / {questions.length}
        </span>
      </div>

      {/* 퀵 네비게이터 */}
      <div className="flex gap-1 flex-wrap">
        {questions.map((q, i) => {
          const a = answers[i]
          const hasInput = Object.values(a.blanks).some(v => v.trim().length > 0)
          return (
            <button
              key={q.number}
              onClick={() => setIndex(i)}
              aria-label={`${q.number}번 문제로 이동`}
              className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                i === index
                  ? 'bg-primary text-primary-foreground'
                  : a.submitted
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : hasInput
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {q.number}
            </button>
          )
        })}
      </div>

      {/* 진행 바 */}
      <div className="w-full bg-muted rounded-full h-1.5" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label="연습 진행률">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 문항 카드 — 모범답안은 제출 후에만 표시 */}
      <QuestionCard
        question={question}
        defaultAnswerOpen={answer.submitted}
        hideAnswers={!answer.submitted}
        conceptLinks={conceptLinksMap[question.number]}
      />

      {/* 빈칸 답안 입력 */}
      {hasBlanks && !answer.submitted && (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground">답안 작성</div>
          {Object.entries(question.blanks!).map(([key, info]) => (
            <div key={key} className="flex items-start gap-2">
              <span className="text-sm font-medium text-muted-foreground shrink-0 mt-2 w-8">{key}</span>
              <input
                type="text"
                value={answer.blanks[key] ?? ''}
                onChange={e => updateBlank(key, e.target.value)}
                placeholder={info.description}
                className="flex-1 min-h-[44px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
              />
            </div>
          ))}
          <button
            onClick={submitAnswer}
            disabled={!hasAnyInput}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            답안 확인
          </button>
        </div>
      )}

      {/* 빈칸 결과 피드백 */}
      {hasBlanks && answer.submitted && blankResults && (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground">채점 결과</div>
          {blankResults.map(r => (
            <div key={r.key} className={`flex items-start gap-2 rounded-lg p-2.5 ${
              r.isCorrect
                ? 'bg-green-50 dark:bg-green-950/20'
                : 'bg-red-50 dark:bg-red-950/20'
            }`}>
              <span className="mt-0.5">
                {r.isCorrect
                  ? <Check className="h-4 w-4 text-green-600" />
                  : <X className="h-4 w-4 text-red-500" />}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-muted-foreground">{r.key}</span>
                <div className="text-sm">
                  <span className={r.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400 line-through'}>
                    {r.userAnswer || '(미입력)'}
                  </span>
                  {!r.isCorrect && (
                    <span className="text-green-700 dark:text-green-300 ml-2">→ {r.expected}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 논술형 — 제출 없이 모범답안만 확인 */}
      {!hasBlanks && !answer.submitted && (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4">
          <p className="text-sm text-muted-foreground mb-3">논술형 문제는 자동 채점이 불가합니다. 직접 작성한 뒤 모범답안과 비교하세요.</p>
          <button
            onClick={submitAnswer}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            모범답안 보기
          </button>
        </div>
      )}

      {/* 하단 네비게이션 */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => setIndex(i => Math.max(0, i - 1))}
          disabled={index === 0}
          className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          이전 문항
        </button>
        {index < questions.length - 1 ? (
          <button
            onClick={() => setIndex(i => i + 1)}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
          >
            다음 문항
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowResult(true)}
            className="flex-1 py-3 rounded-xl bg-green-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            결과 보기
          </button>
        )}
      </div>
    </div>
  )
}
