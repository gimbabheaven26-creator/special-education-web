# KICE 페이지 개선 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기출문제 페이지(KiceClient)에서 ① 출제경향 분석 버튼 제거, ② 한 문제씩 풀기 연습 모드 추가, ③ 답 기본 숨김 (practice mode), ④ 검색 탭 추가.

**Architecture:** KiceClient.tsx 내에서 `practiceIndex: number | null` state로 연습 모드를 관리한다. null이면 기존 리스트 모드, 숫자이면 단일 문항 표시. KiceSearch.tsx는 page.tsx RSC에서 flat 데이터를 전달받는 클라이언트 컴포넌트. 새 페이지 없음.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS v4, @base-ui/react, lucide-react

---

## Chunk 1: 버튼 교체 + practiceIndex state

### Task 1: 출제경향 분석 버튼 → 한 문제씩 풀기 버튼

**Files:**
- Modify: `src/app/kice/KiceClient.tsx`

- [ ] **Step 1: KiceClient.tsx line 6 import 교체**

기존 (line 6):
```tsx
import { Search, FileText, Clock, Award, GitFork, Sparkles, Play, BarChart3 } from 'lucide-react'
```

교체:
```tsx
import { Search, FileText, Clock, Award, GitFork, Sparkles, Play, BookOpen, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'
```

변경: `BarChart3` 제거 → `BookOpen, ChevronLeft, ChevronRight as ChevronRightIcon` 추가

- [ ] **Step 2: KiceClientInner 함수 상단에 practiceIndex state 추가**

`const [compareMode, setCompareMode] = useState(false)` 아래 줄에:
```tsx
const [practiceIndex, setPracticeIndex] = useState<number | null>(null)
```

- [ ] **Step 3: 버튼 교체 (line 244-267)**

기존 코드 (`{/* 모의고사 + 분석 */}` 섹션 전체):
```tsx
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
      render={<Link href="/analytics" />}
      variant="outline"
      size="lg"
      className="flex-1 min-h-[48px]"
    >
      <BarChart3 className="h-5 w-5 mr-2" />
      출제 경향 분석
    </Button>
  </div>
)}
```

교체:
```tsx
{/* 모의고사 + 한 문제씩 풀기 */}
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
      onClick={() => setPracticeIndex(0)}
      variant="outline"
      size="lg"
      className="flex-1 min-h-[48px]"
    >
      <BookOpen className="h-5 w-5 mr-2" />
      한 문제씩 풀기
    </Button>
  </div>
)}
```

- [ ] **Step 4: build 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npm run build 2>&1 | tail -20
```

Expected: exit 0

- [ ] **Step 5: commit**

```bash
git add src/app/kice/KiceClient.tsx
git commit -m "refactor(kice): 출제경향 분석 버튼 제거 → 한 문제씩 풀기 버튼"
```

---

## Chunk 2: 연습 모드 UI + QuestionCard prop

### Task 2: QuestionCard defaultAnswerOpen prop 추가

**Files:**
- Modify: `src/components/kice/ModelAnswers.tsx`
- Modify: `src/components/kice/QuestionCard.tsx`

현재 ModelAnswers는 `useState(false)`로 항상 닫혀서 시작함. 이미 올바른 동작.
QuestionCard에 prop을 추가해 명시적으로 제어할 수 있도록 한다.

- [ ] **Step 1: ModelAnswers.tsx — defaultOpen prop 추가**

현재 `interface ModelAnswersProps` + 함수 시그니처:
```tsx
interface ModelAnswersProps {
  question: KiceQuestion
}

export function ModelAnswers({ question }: ModelAnswersProps) {
  const [open, setOpen] = useState(false)
```

교체:
```tsx
interface ModelAnswersProps {
  question: KiceQuestion
  defaultOpen?: boolean
}

export function ModelAnswers({ question, defaultOpen = false }: ModelAnswersProps) {
  const [open, setOpen] = useState(defaultOpen)
```

나머지 코드 동일.

- [ ] **Step 2: QuestionCard.tsx — defaultAnswerOpen prop 추가 + ModelAnswers에 전달**

현재 전체 파일:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DialogueBlock } from './DialogueBlock'
import { SubItemsBlock } from './SubItemsBlock'
import { ModelAnswers } from './ModelAnswers'
import { SUBJECT_LABELS } from '@/types/kice'
import type { KiceQuestion } from '@/types/kice'

interface QuestionCardProps {
  question: KiceQuestion
}
// ...
export function QuestionCard({ question }: QuestionCardProps) {
  // ...
  return (
    // ...
    <ModelAnswers question={question} />
    // ...
  )
}
```

변경 (interface + 함수 시그니처 + ModelAnswers 호출):
```tsx
interface QuestionCardProps {
  question: KiceQuestion
  defaultAnswerOpen?: boolean
}

export function QuestionCard({ question, defaultAnswerOpen = false }: QuestionCardProps) {
  // scenarioDialogue 로직 등 기존 코드 모두 유지 ...

  return (
    <Card size="sm">
      <CardHeader>
        {/* 기존 헤더 전체 그대로 유지 */}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 기존 context, scenario, dialogue, sub_items, note, tasks 전부 유지 */}
        {/* ModelAnswers만 defaultOpen 추가 */}
        <ModelAnswers question={question} defaultOpen={defaultAnswerOpen} />
      </CardContent>
    </Card>
  )
}
```

> 실제 구현 시: `interface QuestionCardProps`와 함수 첫 줄, `<ModelAnswers ... />` 세 곳만 수정. 나머지 JSX 전부 그대로.

- [ ] **Step 3: TypeScript 컴파일 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors

- [ ] **Step 4: commit**

```bash
git add src/components/kice/ModelAnswers.tsx src/components/kice/QuestionCard.tsx
git commit -m "feat(kice): QuestionCard defaultAnswerOpen prop — 연습 모드 답 노출 제어"
```

---

### Task 3: KiceClient에 연습 모드 렌더링 추가

**Files:**
- Modify: `src/app/kice/KiceClient.tsx`

현재 `{/* 문항 리스트 */}` 섹션 (line ~286-320)을 연습 모드 / 리스트 모드로 분기한다.
키워드 필터(`keywordFilter`) 상태는 두 모드 간 유지된다 — 의도된 동작 (필터된 문항으로 연습 가능).

- [ ] **Step 1: 기존 문항 리스트 섹션을 분기로 교체**

현재 (line ~286-320):
```tsx
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
```

교체 (연습 모드 + 리스트 모드 분기):
```tsx
{/* 연습 모드 */}
{practiceIndex !== null && (
  <>
    {filteredQuestions.length === 0 ? (
      <div className="text-center py-12 text-muted-foreground">
        검색 결과가 없습니다.
      </div>
    ) : (
      <div className="space-y-4">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPracticeIndex(null)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            목록으로
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            {practiceIndex + 1} / {filteredQuestions.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPracticeIndex(i => Math.max(0, (i ?? 0) - 1))}
              disabled={practiceIndex === 0}
              className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPracticeIndex(i => Math.min(filteredQuestions.length - 1, (i ?? 0) + 1))}
              disabled={practiceIndex === filteredQuestions.length - 1}
              className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors disabled:opacity-40"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((practiceIndex + 1) / filteredQuestions.length) * 100}%` }}
          />
        </div>

        {/* 현재 문항 */}
        <QuestionCard
          question={filteredQuestions[practiceIndex]}
          defaultAnswerOpen={false}
        />

        {/* 하단 네비게이션 */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setPracticeIndex(i => Math.max(0, (i ?? 0) - 1))}
            disabled={practiceIndex === 0}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-40"
          >
            이전 문항
          </button>
          {practiceIndex < filteredQuestions.length - 1 ? (
            <button
              onClick={() => setPracticeIndex(i => (i ?? 0) + 1)}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              다음 문항
            </button>
          ) : (
            <button
              onClick={() => setPracticeIndex(null)}
              className="flex-1 py-3 rounded-xl bg-green-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              완료 — 목록으로
            </button>
          )}
        </div>
      </div>
    )}
  </>
)}

{/* 리스트 모드 */}
{practiceIndex === null && (
  <>
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
  </>
)}
```

- [ ] **Step 2: build 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npm run build 2>&1 | tail -20
```

Expected: exit 0

- [ ] **Step 3: commit**

```bash
git add src/app/kice/KiceClient.tsx
git commit -m "feat(kice): 한 문제씩 풀기 연습 모드 — prev/next 네비게이션 + 진행 바"
```

---

## Chunk 3: 키워드 검색 탭

### Task 4: SearchItem 타입 정의 + page.tsx 데이터 준비

**Files:**
- Modify: `src/app/kice/page.tsx`
- Create: `src/app/kice/KiceSearch.tsx`

KiceSearch는 RSC(page.tsx)에서 flat 데이터를 받는 순수 클라이언트 컴포넌트.
`require()`는 사용하지 않음 — 모든 데이터는 서버에서 준비.

- [ ] **Step 1: KiceSearch.tsx 생성**

`src/app/kice/KiceSearch.tsx`:

```tsx
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

export interface KiceSearchItem {
  year: number
  session: string
  number: number
  points: number
  context: string
  keywords: string[]
  subjects: string[]
}

interface KiceSearchProps {
  items: KiceSearchItem[]
}

export default function KiceSearch({ items }: KiceSearchProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return []
    const lower = query.toLowerCase()
    return items.filter(q =>
      q.keywords.some(kw => kw.toLowerCase().includes(lower)) ||
      q.subjects.some(s => s.toLowerCase().includes(lower)) ||
      q.context.toLowerCase().includes(lower)
    ).slice(0, 30)
  }, [query, items])

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">기출 키워드 검색</h1>
        <p className="text-sm text-muted-foreground mt-1">키워드, 과목, 지문으로 기출문제를 찾아보세요</p>
      </div>

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
          키워드 검색
        </span>
      </div>

      {/* 검색창 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          autoFocus
          placeholder="예: ABA, PECS, 중다기초선..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* 안내 문구 (검색 전) */}
      {!query && (
        <p className="text-center text-sm text-muted-foreground py-4">
          키워드를 입력하면 전체 기출 문항에서 검색합니다.
        </p>
      )}

      {/* 검색 결과 없음 */}
      {query && results.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">검색 결과가 없습니다.</p>
      )}

      {/* 결과 목록 */}
      <div className="space-y-3">
        {results.map((q, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground">{q.year} {q.session}</span>
              <span className="text-xs font-medium text-muted-foreground">Q{q.number}</span>
              <span className="text-xs text-muted-foreground">{q.points}점</span>
            </div>
            <p className="text-sm text-foreground line-clamp-3 whitespace-pre-wrap">{q.context}</p>
            <div className="flex gap-1 flex-wrap">
              {q.keywords.map(kw => (
                <span key={kw} className="text-xs bg-muted/50 rounded px-1.5 py-0.5 text-muted-foreground">
                  #{kw}
                </span>
              ))}
            </div>
            <Link
              href={`/kice?year=${q.year}&session=${encodeURIComponent(q.session)}`}
              className="text-xs text-primary hover:underline"
            >
              이 시험지 보기 →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: page.tsx에 search 탭 처리 + 데이터 준비**

`src/app/kice/page.tsx` 전체:

```tsx
import { getAvailableExams, getExam } from '@/lib/kice'
import { getSubjects, getAllWorksheetTopics } from '@/lib/db'
import KiceClient from './KiceClient'
import KiceByArea from './KiceByArea'
import KiceSearch, { type KiceSearchItem } from './KiceSearch'

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
```

- [ ] **Step 3: TypeScript 컴파일 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors

---

### Task 5: 탭 바 — 모든 탭에 "키워드 검색" 추가

**Files:**
- Modify: `src/app/kice/KiceClient.tsx` — by-year 탭에 추가
- Modify: `src/app/kice/KiceByArea.tsx` — by-area 탭에 추가

- [ ] **Step 1: KiceClient.tsx 탭 바에 "키워드 검색" 탭 링크 추가**

현재 탭 바 (line ~104-117):
```tsx
{/* 탭 전환 */}
<div className="flex border-b border-border">
  <Link
    href="/kice?tab=by-year"
    className="px-4 py-2.5 text-sm font-semibold border-b-2 border-primary text-primary"
  >
    연도별 기출
  </Link>
  <Link
    href="/kice?tab=by-area"
    className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent"
  >
    영역별 기출
  </Link>
</div>
```

교체:
```tsx
{/* 탭 전환 */}
<div className="flex border-b border-border">
  <Link
    href="/kice?tab=by-year"
    className="px-4 py-2.5 text-sm font-semibold border-b-2 border-primary text-primary"
  >
    연도별 기출
  </Link>
  <Link
    href="/kice?tab=by-area"
    className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent"
  >
    영역별 기출
  </Link>
  <Link
    href="/kice?tab=search"
    className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent"
  >
    키워드 검색
  </Link>
</div>
```

- [ ] **Step 2: KiceByArea.tsx 탭 바 확인 + 추가**

KiceByArea.tsx에서 `{/* 탭 전환 */}` 또는 탭 관련 섹션을 찾아 같은 패턴으로 "키워드 검색" 탭 링크 추가.
현재 탭 상태 확인 후 (line ~30 이후):
```tsx
<Link
  href="/kice?tab=search"
  className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent"
>
  키워드 검색
</Link>
```
를 연도별/영역별 링크 다음에 추가.

- [ ] **Step 3: build + 최종 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npm run build 2>&1 | tail -20
```

Expected: exit 0

- [ ] **Step 4: commit**

```bash
git add src/app/kice/
git commit -m "feat(kice): 키워드 검색 탭 — RSC 데이터 준비 + 클라이언트 검색 컴포넌트"
```

---

## 최종 검증

- [ ] `npm run build` exit 0
- [ ] `npm run dev` 후 `/kice` 접속:
  - [ ] "출제경향 분석" 버튼 없어짐
  - [ ] 탭: 연도별 기출 / 영역별 기출 / 키워드 검색 3개 보임
  - [ ] "한 문제씩 풀기" 클릭 → 연습 모드 진입, "1 / N" 표시, 진행 바 보임
  - [ ] prev/next 버튼 동작, 마지막 문항에서 "완료 — 목록으로" 노출
  - [ ] "목록으로" 버튼 → 리스트 모드로 복귀
  - [ ] 연습 모드에서 모범답안 기본 숨김 ("모범답안 보기" 클릭 시 노출)
  - [ ] 키워드 검색 탭 → "ABA" 등 입력 시 결과 표시
  - [ ] 결과 "이 시험지 보기" 클릭 → 해당 연도/세션으로 이동
