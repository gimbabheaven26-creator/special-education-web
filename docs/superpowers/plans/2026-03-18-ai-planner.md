# AI 어시스턴트 + D-day 학습 플래너 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ① 커뮤니티 Supabase 테이블 활성화 (카이란 SQL) ② Gemini AI 어시스턴트 실제 연결 ③ D-day 학습 플래너 (시험일 역산 + 주차별 목표) ④ 오답노트 AI 약점 분석

**Architecture:**
- Gemini stub → 실제 `@google/generative-ai` 호출 (서버 Route Handler)
- D-day 플래너: Zustand `useStudyStore`에 `examDate` 필드 추가 + `/my` 페이지 설정 UI
- AI 약점 분석: 오답노트 데이터 → `/api/ai/weakness` 라우트 → Gemini 프롬프트

**Tech Stack:** Next.js 14 App Router, Supabase, Gemini API, TypeScript, Tailwind CSS v4

---

## 사전 요건 (카이란 실행)

### A. community_questions + question_votes Supabase SQL

Supabase 대시보드 → SQL Editor 에서 실행:

```sql
-- community_questions 테이블
CREATE TABLE IF NOT EXISTS community_questions (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_display_name  TEXT        NOT NULL DEFAULT '',
  question_type        TEXT        NOT NULL CHECK (question_type IN ('multiple','ox','fill_in','descriptive')),
  question_text        TEXT        NOT NULL,
  options              JSONB       NULL,
  correct_answer       TEXT        NOT NULL,
  explanation          TEXT        NOT NULL DEFAULT '',
  subject_id           TEXT        NOT NULL REFERENCES subjects(slug) ON DELETE CASCADE,
  chapter_id           TEXT        NULL,
  status               TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','official')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- question_votes 테이블
CREATE TABLE IF NOT EXISTS question_votes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID        NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type    TEXT        NOT NULL CHECK (vote_type IN ('up','down')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- RLS
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cq_select_public" ON community_questions;
CREATE POLICY "cq_select_public" ON community_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "cq_insert_auth" ON community_questions;
CREATE POLICY "cq_insert_auth" ON community_questions FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "cq_update_own" ON community_questions;
CREATE POLICY "cq_update_own" ON community_questions FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "cq_delete_own" ON community_questions;
CREATE POLICY "cq_delete_own" ON community_questions FOR DELETE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "votes_select_public" ON question_votes;
CREATE POLICY "votes_select_public" ON question_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "votes_insert_auth" ON question_votes;
CREATE POLICY "votes_insert_auth" ON question_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "votes_delete_own" ON question_votes;
CREATE POLICY "votes_delete_own" ON question_votes FOR DELETE USING (auth.uid() = user_id);
```

### B. GEMINI_API_KEY 설정

`.env.local`에 추가:
```
GEMINI_API_KEY=your_key_here
```
Google AI Studio (aistudio.google.com) → API Key 발급 → .env.local 저장.

> **카이란 확인 필요**: A + B 완료 후 강선생에게 알림. 완료 전까지 Chunk 2 진행 불가.

---

## Chunk 1: Gemini API 실제 연결

### Task 1: @google/generative-ai 설치 + AI Route 완성

**Files:**
- Modify: `src/app/api/community/ai-assist/route.ts`

- [ ] **Step 1: 패키지 설치**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npm install @google/generative-ai
```

- [ ] **Step 2: route.ts — mock 제거 + 실제 Gemini 호출**

현재 파일에서 mock 응답 부분을 교체:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ feedback: '(AI 어시스턴트 미설정)' });
  }

  const { questionText, userAnswer, correctAnswer, explanation } = await request.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `당신은 특수교육학 임용시험 전문 튜터입니다.
학습자가 다음 문제에 답했습니다.

문제: ${questionText}
정답: ${correctAnswer}
학습자 답변: ${userAnswer}
해설: ${explanation}

학습자의 이해 수준을 파악하고, 핵심 개념을 짧게(3~4문장) 설명해주세요.
틀렸다면 왜 틀렸는지, 맞았다면 더 깊이 알아야 할 내용을 알려주세요.`;

  const result = await model.generateContent(prompt);
  const feedback = result.response.text();
  return NextResponse.json({ feedback });
}
```

- [ ] **Step 3: TypeScript 컴파일 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npx tsc --noEmit 2>&1 | head -10
```

Expected: 0 errors

- [ ] **Step 4: commit**

```bash
git add src/app/api/community/ai-assist/route.ts package.json package-lock.json
git commit -m "feat(ai): Gemini 1.5-flash 실제 연결 — 커뮤니티 AI 어시스턴트"
```

---

## Chunk 2: D-day 학습 플래너

### Task 2: useStudyStore에 examDate 추가 + /my 설정 UI

**Files:**
- Modify: `src/store/useStudyStore.ts` (또는 실제 경로)
- Modify: `src/app/my/page.tsx`
- Create: `src/components/ExamCountdown.tsx`

- [ ] **Step 1: useStudyStore에 examDate 필드 추가**

```typescript
// useStudyStore에 추가
examDate: string | null  // ISO date string, e.g. '2026-11-07'
setExamDate: (date: string | null) => void
```

state 초기값: `examDate: null`
persist에 포함 (localStorage 저장).

- [ ] **Step 2: ExamCountdown.tsx 컴포넌트 생성**

`src/components/ExamCountdown.tsx`:

```tsx
'use client';

import { useStudyStore } from '@/store/useStudyStore';
import { useState } from 'react';

export function ExamCountdown() {
  const { examDate, setExamDate } = useStudyStore();
  const [editing, setEditing] = useState(false);

  const dDay = examDate
    ? Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (editing || !examDate) {
    return (
      <div className="p-4 rounded-xl border border-border bg-card space-y-2">
        <p className="text-sm font-medium">시험일을 설정해주세요</p>
        <div className="flex gap-2">
          <input
            type="date"
            defaultValue={examDate ?? ''}
            onChange={e => setExamDate(e.target.value || null)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  const isOver = dDay !== null && dDay < 0;
  const label = isOver ? '시험 종료' : dDay === 0 ? 'D-Day!' : `D-${dDay}`;

  return (
    <div
      className="p-4 rounded-xl border border-border bg-card flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => setEditing(true)}
    >
      <div>
        <p className="text-xs text-muted-foreground">임용시험까지</p>
        <p className="text-2xl font-bold text-primary">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(examDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="text-right">
        {dDay !== null && dDay > 0 && (
          <>
            <p className="text-xs text-muted-foreground">남은 주</p>
            <p className="text-lg font-semibold text-foreground">{Math.ceil(dDay / 7)}주</p>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: /my/page.tsx 상단에 ExamCountdown 추가**

imports에 추가:
```tsx
import { ExamCountdown } from '@/components/ExamCountdown';
```

프로필 섹션 바로 아래에 삽입:
```tsx
<ExamCountdown />
```

- [ ] **Step 4: build 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npm run build 2>&1 | tail -10
```

Expected: exit 0

- [ ] **Step 5: commit**

```bash
git add src/store/useStudyStore.ts src/components/ExamCountdown.tsx src/app/my/page.tsx
git commit -m "feat(planner): D-day 카운트다운 — /my 시험일 설정 + ExamCountdown 컴포넌트"
```

---

## Chunk 3: 오답노트 AI 약점 분석

### Task 3: /api/ai/weakness 라우트 + WrongNoteAI 컴포넌트

**Files:**
- Create: `src/app/api/ai/weakness/route.ts`
- Create: `src/components/WrongNoteAI.tsx`
- Modify: `src/app/wrong-notes/page.tsx` (또는 오답노트 클라이언트)

- [ ] **Step 1: /api/ai/weakness route 생성**

`src/app/api/ai/weakness/route.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ analysis: null, error: 'AI 미설정' });
  }

  const { weakChapters } = await request.json() as { weakChapters: Array<{ chapter: string; subject: string; wrongCount: number }> };

  if (!weakChapters || weakChapters.length === 0) {
    return NextResponse.json({ analysis: '오답 데이터가 없습니다.' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const chapterList = weakChapters
    .slice(0, 10)
    .map(c => `- ${c.subject} > ${c.chapter}: ${c.wrongCount}회 오답`)
    .join('\n');

  const prompt = `당신은 특수교육학 임용시험 전문 학습 코치입니다.
학습자의 오답 현황입니다:

${chapterList}

다음 형식으로 분석해주세요 (한국어, 4~6문장):
1. 가장 취약한 영역과 그 이유 (이론적 배경)
2. 오늘 당장 복습해야 할 최우선 챕터 1~2개
3. 효과적인 학습 전략 1가지 (구체적으로)`;

  const result = await model.generateContent(prompt);
  return NextResponse.json({ analysis: result.response.text() });
}
```

- [ ] **Step 2: WrongNoteAI 컴포넌트 생성**

`src/components/WrongNoteAI.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface WeakChapter {
  chapter: string;
  subject: string;
  wrongCount: number;
}

interface WrongNoteAIProps {
  weakChapters: WeakChapter[];
}

export function WrongNoteAI({ weakChapters }: WrongNoteAIProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/weakness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weakChapters }),
      });
      const data = await res.json();
      setAnalysis(data.analysis ?? '분석 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">AI 약점 분석</span>
        </div>
        <button
          onClick={analyze}
          disabled={loading || weakChapters.length === 0}
          className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {loading ? '분석 중...' : '분석하기'}
        </button>
      </div>
      {analysis && (
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{analysis}</p>
      )}
      {!analysis && !loading && (
        <p className="text-xs text-muted-foreground">"분석하기"를 누르면 취약 챕터와 학습 전략을 알려드립니다.</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 오답노트 페이지에 WrongNoteAI 통합**

오답노트 클라이언트 컴포넌트 상단에 `WrongNoteAI` 추가.
`weakChapters` prop: 오답노트에서 챕터별 오답 횟수 집계 후 전달 (상위 10개).

- [ ] **Step 4: build + 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web && npm run build 2>&1 | tail -10
```

Expected: exit 0

- [ ] **Step 5: commit**

```bash
git add src/app/api/ai/weakness/route.ts src/components/WrongNoteAI.tsx
git commit -m "feat(ai): 오답노트 AI 약점 분석 — Gemini 기반 취약 챕터 + 학습 전략"
```

---

## 검증 체크리스트

- [ ] community_questions, question_votes 테이블 생성 완료 (카이란 SQL)
- [ ] GEMINI_API_KEY 설정 완료 (카이란 .env.local)
- [ ] `/community/create` → 문제 제출 → DB 저장 확인
- [ ] `/community` → 문제 목록 표시 확인
- [ ] 커뮤니티 AI 어시스턴트 버튼 클릭 → 실제 Gemini 응답
- [ ] `/my` → D-day 카운트다운 표시 + 날짜 수정 가능
- [ ] 오답노트 "분석하기" → AI 약점 분석 표시
- [ ] `npm run build` exit 0

---

## 카이란 액션 요약

| 액션 | 방법 |
|------|------|
| community SQL 실행 | Supabase SQL Editor → 위 SQL 전체 복붙 → Run |
| GEMINI_API_KEY 설정 | aistudio.google.com → API Key → `.env.local`에 `GEMINI_API_KEY=...` 추가 |
