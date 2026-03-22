# Community + 문제 제작 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사용자가 특수교육 문제를 직접 제작·공유하고, 커뮤니티 갤러리에서 투표하며 풀어볼 수 있는 기능을 구현한다.

**Architecture:** 기존 RSC(page.tsx) → Client Component props 패턴을 유지한다. 문제 제출·투표는 인증이 필요한 API Route로 처리하고, Supabase RLS가 서버에서도 이중 보호한다. AI 어시스턴트는 GEMINI_API_KEY 환경변수 유무에 따라 실제/mock 응답을 반환하는 stub으로 구현한다.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (PostgreSQL + RLS), @supabase/ssr, Vitest

**의존성:** Plan B (Role System) SQL 실행 완료 후 진행 권장 — profiles.nickname 컬럼이 작성자 표시명에 사용됨.

---

## 파일 목록

| 파일 | 유형 | 역할 |
|------|------|------|
| `docs/contract.md` | 수정 | v2.6: community_questions + question_votes 스키마 추가 |
| `src/types/community.ts` | 신규 | CommunityQuestion, CreateQuestionInput 등 타입 |
| `src/lib/community-db.ts` | 신규 | community_questions / question_votes DB 쿼리 함수 |
| `src/tests/community-db.test.ts` | 신규 | community-db 단위 테스트 |
| `src/app/community/page.tsx` | 신규 | 갤러리 RSC |
| `src/app/community/CommunityClient.tsx` | 신규 | 갤러리 클라이언트 (필터/정렬) |
| `src/app/community/create/page.tsx` | 신규 | 문제 제작 RSC |
| `src/app/community/create/CreateClient.tsx` | 신규 | 4단계 위저드 클라이언트 |
| `src/app/community/[id]/page.tsx` | 신규 | 문제 상세 RSC |
| `src/app/community/[id]/QuestionDetailClient.tsx` | 신규 | 풀어보기 + 투표 클라이언트 |
| `src/app/api/community/route.ts` | 신규 | POST: 문제 제출 (인증 필요) |
| `src/app/api/community/[id]/vote/route.ts` | 신규 | POST: 투표 (인증 필요) |
| `src/app/api/ai-assist/route.ts` | 신규 | POST: AI 검증 stub |
| `src/components/layout/Header.tsx` | 수정 | navLinks에 /community 추가 |

---

## 전제조건: Supabase SQL 실행 (카이란 실행 필요)

아래 SQL을 Supabase 대시보드 > SQL Editor에서 실행해야 Task 3+ 구현이 가능하다.

```sql
-- 1. community_questions
CREATE TABLE IF NOT EXISTS community_questions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_display_name TEXT        NOT NULL DEFAULT '',
  question_type       TEXT        NOT NULL CHECK (question_type IN ('multiple','ox','fill_in','descriptive')),
  question_text       TEXT        NOT NULL,
  options             JSONB       NULL,
  correct_answer      TEXT        NOT NULL,
  explanation         TEXT        NOT NULL DEFAULT '',
  subject_id          TEXT        NOT NULL REFERENCES subjects(slug),
  chapter_id          TEXT        NULL,
  status              TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','official')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. question_votes
CREATE TABLE IF NOT EXISTS question_votes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID        NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type   TEXT        NOT NULL CHECK (vote_type IN ('up','down')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (question_id, user_id)
);

-- 3. RLS: community_questions
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cq_public_read"   ON community_questions FOR SELECT USING (true);
CREATE POLICY "cq_auth_insert"   ON community_questions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "cq_author_update" ON community_questions FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "cq_author_delete" ON community_questions FOR DELETE USING (auth.uid() = author_id);

-- 4. RLS: question_votes
ALTER TABLE question_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qv_public_read" ON question_votes FOR SELECT USING (true);
CREATE POLICY "qv_auth_insert" ON question_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "qv_auth_delete" ON question_votes FOR DELETE USING (auth.uid() = user_id);
```

---

## Chunk 1: Foundation — contract.md + Types + DB Functions

### Task 1: contract.md v2.6 업데이트

**Files:**
- Modify: `docs/contract.md`

- [ ] **Step 1: 헤더 버전 업데이트**

`docs/contract.md` 첫 4줄을 교체:

기존:
```
> 강선생(UI)과 클루디(데이터)의 인터페이스 계약서
> 최종 수정: 2026-03-17 | 버전: 2.4
> v2.4: Auth 역할 변경 — profiles/user_data 설정 강선생으로 이전 (클루디는 콘텐츠 데이터 전담)
> v2.4: Auth 프로바이더 확정 — Kakao OAuth + Google OAuth + 이메일/비밀번호
```

교체:
```
> 강선생(UI)과 클루디(데이터)의 인터페이스 계약서
> 최종 수정: 2026-03-18 | 버전: 2.6
> v2.6: community_questions + question_votes 테이블 추가 (커뮤니티 문제 제작)
> v2.5: profiles — role + nickname 컬럼 추가 (권한 시스템, Plan B)
> v2.4: Auth 역할 변경 — profiles/user_data 설정 강선생으로 이전 (클루디는 콘텐츠 데이터 전담)
> v2.4: Auth 프로바이더 확정 — Kakao OAuth + Google OAuth + 이메일/비밀번호
```

- [ ] **Step 2: reviews 섹션 아래에 두 테이블 스펙 추가**

`docs/contract.md`의 reviews 섹션 끝 아래에 추가:

```markdown
### community_questions (v2.6 신규 — 커뮤니티 문제 제작)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | **PK**, DEFAULT gen_random_uuid() | 문제 ID |
| author_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | 작성자 |
| author_display_name | text | NOT NULL DEFAULT '' | 작성 시점 표시명 (비정규화 스냅샷) |
| question_type | text | NOT NULL CHECK (IN 'multiple','ox','fill_in','descriptive') | 문제 유형 |
| question_text | text | NOT NULL | 문제 본문 |
| options | jsonb | NULL | 객관식 선택지 (multiple 유형만) |
| correct_answer | text | NOT NULL | 정답 |
| explanation | text | NOT NULL DEFAULT '' | 해설 |
| subject_id | text | NOT NULL, FK → subjects(slug) | 과목 |
| chapter_id | text | NULL | 챕터 slug (chapters.slug 참조, FK 없음) |
| status | text | NOT NULL DEFAULT 'pending' CHECK (IN 'pending','official') | 승인 상태 |
| created_at | timestamptz | NOT NULL DEFAULT now() | 작성 시간 |
| updated_at | timestamptz | NOT NULL DEFAULT now() | 수정 시간 |

- RLS: 읽기 공개; INSERT = 인증 사용자(author_id = auth.uid()); UPDATE/DELETE = 작성자 본인
- `author_display_name`: profiles.nickname → profiles.display_name → email prefix 순서로 스냅샷
- `chapter_id`: chapters 테이블이 복합 PK(subject_slug, slug)이므로 FK 없이 slug만 저장

### question_votes (v2.6 신규)

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | **PK**, DEFAULT gen_random_uuid() | 투표 ID |
| question_id | uuid | NOT NULL, FK → community_questions(id) ON DELETE CASCADE | 대상 문제 |
| user_id | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | 투표자 |
| vote_type | text | NOT NULL CHECK (IN 'up','down') | 투표 유형 |
| created_at | timestamptz | NOT NULL DEFAULT now() | 투표 시간 |

- **UNIQUE(question_id, user_id)** — 사용자당 문제 1표
- RLS: 읽기 공개; INSERT = 인증 사용자(user_id = auth.uid()); DELETE = 본인
```

- [ ] **Step 3: commit**

```bash
git add docs/contract.md
git commit -m "docs: contract.md v2.6 — community_questions + question_votes 스키마 추가"
```

---

### Task 2: CommunityQuestion 타입 정의

**Files:**
- Create: `src/types/community.ts`

- [ ] **Step 1: 타입 파일 생성**

`src/types/community.ts` — 전체:

```typescript
export type QuestionType = 'multiple' | 'ox' | 'fill_in' | 'descriptive';
export type QuestionStatus = 'pending' | 'official';
export type VoteType = 'up' | 'down';
export type SortOrder = 'latest' | 'votes';

export interface CommunityQuestion {
  id: string;
  author_id: string;
  author_display_name: string;
  question_type: QuestionType;
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  subject_id: string;
  chapter_id: string | null;
  status: QuestionStatus;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityQuestionDetail extends CommunityQuestion {
  user_vote: VoteType | null;
}

export interface CreateQuestionInput {
  question_type: QuestionType;
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  subject_id: string;
  chapter_id: string | null;
}
```

- [ ] **Step 2: commit**

```bash
git add src/types/community.ts
git commit -m "feat(community): CommunityQuestion 타입 정의"
```

---

### Task 3: community-db.ts + 단위 테스트

**Files:**
- Create: `src/lib/community-db.ts`
- Create: `src/tests/community-db.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

`src/tests/community-db.test.ts` — 전체:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import {
  getCommunityQuestions,
  getCommunityQuestionById,
  getUserVoteForQuestion,
  createCommunityQuestion,
  setVote,
} from '@/lib/community-db';
import { createClient } from '@/lib/supabase/server';

// Supabase 쿼리 빌더 mock — select/eq/order는 this 반환, await 시 result 반환
class MockQueryBuilder {
  private result: { data: unknown; error: unknown };
  constructor(result: { data: unknown; error: unknown }) { this.result = result; }
  select(_: string) { return this; }
  eq(_k: string, _v: unknown) { return this; }
  order(_k: string, _opts?: unknown) { return this; }
  single() { return Promise.resolve(this.result); }
  then<T>(
    resolve: (v: { data: unknown; error: unknown }) => T,
    reject?: (e: unknown) => T,
  ) { return Promise.resolve(this.result).then(resolve, reject); }
  catch<T>(reject: (e: unknown) => T) { return Promise.resolve(this.result).catch(reject); }
  finally(fn: () => void) { return Promise.resolve(this.result).finally(fn); }
}

function makeSupabase(result: { data: unknown; error: unknown }) {
  return { from: vi.fn(() => new MockQueryBuilder(result)) };
}

const baseRow = {
  id: 'q1',
  author_id: 'u1',
  author_display_name: '홍길동',
  question_type: 'multiple',
  question_text: '다음 중 IEP의 구성 요소가 아닌 것은?',
  options: ['현행 수준', '연간 목표', '관련 서비스', '출결 현황'],
  correct_answer: '4',
  explanation: '출결 현황은 IEP 필수 항목이 아니다.',
  subject_id: 'introduction',
  chapter_id: null,
  status: 'pending',
  created_at: '2026-03-18T00:00:00Z',
  updated_at: '2026-03-18T00:00:00Z',
  question_votes: [{ count: '7' }],
};

describe('getCommunityQuestions', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('DB 에러 시 빈 배열 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: null, error: new Error('fail') }),
    );
    const result = await getCommunityQuestions();
    expect(result).toEqual([]);
  });

  it('vote_count를 question_votes[0].count 문자열에서 파싱', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: [baseRow], error: null }),
    );
    const result = await getCommunityQuestions();
    expect(result[0].vote_count).toBe(7);
    expect(result[0].author_display_name).toBe('홍길동');
  });

  it('question_votes 빈 배열이면 vote_count = 0', async () => {
    const row = { ...baseRow, question_votes: [] };
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: [row], error: null }),
    );
    const result = await getCommunityQuestions();
    expect(result[0].vote_count).toBe(0);
  });

  it('sort=votes 옵션 시 vote_count 내림차순 정렬', async () => {
    const rows = [
      { ...baseRow, id: 'q1', question_votes: [{ count: '3' }] },
      { ...baseRow, id: 'q2', question_votes: [{ count: '10' }] },
    ];
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: rows, error: null }),
    );
    const result = await getCommunityQuestions({ sort: 'votes' });
    expect(result[0].vote_count).toBe(10);
    expect(result[1].vote_count).toBe(3);
  });
});

describe('getCommunityQuestionById', () => {
  it('없는 ID 시 null 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: null, error: new Error('not found') }),
    );
    const result = await getCommunityQuestionById('nonexistent');
    expect(result).toBeNull();
  });

  it('존재하는 ID 시 CommunityQuestion 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: baseRow, error: null }),
    );
    const result = await getCommunityQuestionById('q1');
    expect(result?.id).toBe('q1');
    expect(result?.vote_count).toBe(7);
  });
});

describe('getUserVoteForQuestion', () => {
  it('투표 없으면 null 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: null, error: null }),
    );
    const result = await getUserVoteForQuestion('q1', 'u1');
    expect(result).toBeNull();
  });

  it('투표 있으면 vote_type 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: { vote_type: 'up' }, error: null }),
    );
    const result = await getUserVoteForQuestion('q1', 'u1');
    expect(result).toBe('up');
  });
});

describe('createCommunityQuestion', () => {
  it('DB 에러 시 null 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: null, error: new Error('insert fail') }),
    );
    const result = await createCommunityQuestion(
      { question_type: 'ox', question_text: '맞냐', options: null,
        correct_answer: 'O', explanation: '', subject_id: 'laws', chapter_id: null },
      'u1', '홍길동',
    );
    expect(result).toBeNull();
  });

  it('성공 시 { id } 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: { id: 'new-q1' }, error: null }),
    );
    const result = await createCommunityQuestion(
      { question_type: 'ox', question_text: '맞냐', options: null,
        correct_answer: 'O', explanation: '', subject_id: 'laws', chapter_id: null },
      'u1', '홍길동',
    );
    expect(result?.id).toBe('new-q1');
  });
});

describe('setVote', () => {
  it('voteType=null 시 delete 경로 — 에러 없으면 { error: null }', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: null, error: null }),
    );
    const result = await setVote('q1', 'u1', null);
    expect(result.error).toBeNull();
  });

  it('voteType=up 시 upsert 경로 — DB 에러 있으면 에러 메시지 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: null, error: new Error('upsert fail') }),
    );
    const result = await setVote('q1', 'u1', 'up');
    expect(result.error).toBe('upsert fail');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web
npx vitest run src/tests/community-db.test.ts
```

Expected: FAIL — "Cannot find module '@/lib/community-db'"

- [ ] **Step 3: community-db.ts 구현**

`src/lib/community-db.ts` — 전체:

```typescript
import { createClient } from '@/lib/supabase/server';
import type {
  CommunityQuestion,
  CreateQuestionInput,
  VoteType,
} from '@/types/community';

// ─── Internal ───

interface RawRow {
  id: string;
  author_id: string;
  author_display_name: string;
  question_type: string;
  question_text: string;
  options: unknown;
  correct_answer: string;
  explanation: string;
  subject_id: string;
  chapter_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  question_votes: { count: string }[];
}

function mapRow(row: RawRow): CommunityQuestion {
  return {
    id: row.id,
    author_id: row.author_id,
    author_display_name: row.author_display_name,
    question_type: row.question_type as CommunityQuestion['question_type'],
    question_text: row.question_text,
    options: Array.isArray(row.options) ? (row.options as string[]) : null,
    correct_answer: row.correct_answer,
    explanation: row.explanation,
    subject_id: row.subject_id,
    chapter_id: row.chapter_id,
    status: row.status as CommunityQuestion['status'],
    vote_count: parseInt(row.question_votes?.[0]?.count ?? '0', 10),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ─── Public ───

export async function getCommunityQuestions(opts: {
  subjectId?: string;
  sort?: 'latest' | 'votes';
} = {}): Promise<CommunityQuestion[]> {
  const supabase = await createClient();
  let query = supabase
    .from('community_questions')
    .select('*, question_votes(count)')
    .order('created_at', { ascending: false });

  if (opts.subjectId) {
    query = query.eq('subject_id', opts.subjectId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const result = (data as RawRow[]).map(mapRow);
  if (opts.sort === 'votes') {
    result.sort((a, b) => b.vote_count - a.vote_count);
  }
  return result;
}

export async function getCommunityQuestionById(
  id: string,
): Promise<CommunityQuestion | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('community_questions')
    .select('*, question_votes(count)')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return mapRow(data as RawRow);
}

export async function getUserVoteForQuestion(
  questionId: string,
  userId: string,
): Promise<VoteType | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('question_votes')
    .select('vote_type')
    .eq('question_id', questionId)
    .eq('user_id', userId)
    .single();
  return (data?.vote_type as VoteType | null) ?? null;
}

export async function createCommunityQuestion(
  input: CreateQuestionInput,
  userId: string,
  authorDisplayName: string,
): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('community_questions')
    .insert({
      author_id: userId,
      author_display_name: authorDisplayName,
      question_type: input.question_type,
      question_text: input.question_text,
      options: input.options,
      correct_answer: input.correct_answer,
      explanation: input.explanation,
      subject_id: input.subject_id,
      chapter_id: input.chapter_id,
    })
    .select('id')
    .single();
  if (error || !data) return null;
  return { id: (data as { id: string }).id };
}

export async function setVote(
  questionId: string,
  userId: string,
  voteType: VoteType | null,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (voteType === null) {
    const { error } = await supabase
      .from('question_votes')
      .delete()
      .eq('question_id', questionId)
      .eq('user_id', userId);
    return { error: error?.message ?? null };
  }
  const { error } = await supabase.from('question_votes').upsert(
    { question_id: questionId, user_id: userId, vote_type: voteType },
    { onConflict: 'question_id,user_id' },
  );
  return { error: error?.message ?? null };
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/tests/community-db.test.ts
```

Expected: PASS — 11 tests passed, 0 failed

- [ ] **Step 5: commit**

```bash
git add src/lib/community-db.ts src/tests/community-db.test.ts
git commit -m "feat(community): community-db.ts — getCommunityQuestions, vote, create 함수 + 테스트 11건"
```

---

## Chunk 2: Gallery + Wizard

### Task 4: /community 갤러리 페이지

**Files:**
- Create: `src/app/community/page.tsx`
- Create: `src/app/community/CommunityClient.tsx`

- [ ] **Step 1: RSC page.tsx 생성**

`src/app/community/page.tsx` — 전체:

```tsx
import { getCommunityQuestions } from '@/lib/community-db';
import { getSubjects } from '@/lib/db';
import CommunityClient from './CommunityClient';

export default async function CommunityPage() {
  const [questions, subjects] = await Promise.all([
    getCommunityQuestions({ sort: 'latest' }),
    getSubjects(),
  ]);
  return (
    <CommunityClient
      initialQuestions={questions}
      subjects={subjects.map((s) => ({ slug: s.slug, title: s.title }))}
    />
  );
}
```

- [ ] **Step 2: CommunityClient.tsx 생성**

`src/app/community/CommunityClient.tsx` — 전체:

```tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ThumbsUp, Plus, CheckCircle2 } from 'lucide-react';
import type { CommunityQuestion, SortOrder } from '@/types/community';

interface Props {
  initialQuestions: CommunityQuestion[];
  subjects: { slug: string; title: string }[];
}

const TYPE_LABEL: Record<string, string> = {
  multiple: '객관식',
  ox: 'OX',
  fill_in: '빈칸',
  descriptive: '서술형',
};

export default function CommunityClient({ initialQuestions, subjects }: Props) {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortOrder>('latest');

  const filtered = useMemo(() => {
    let result = [...initialQuestions];
    if (subjectFilter !== 'all') {
      result = result.filter((q) => q.subject_id === subjectFilter);
    }
    if (sort === 'votes') {
      result.sort((a, b) => b.vote_count - a.vote_count);
    } else {
      result.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }
    return result;
  }, [initialQuestions, subjectFilter, sort]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">커뮤니티 문제</h1>
          <p className="text-sm text-muted-foreground mt-1">
            사용자가 제작한 특수교육 문제를 풀어보세요.
          </p>
        </div>
        <Link
          href="/community/create"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          문제 만들기
        </Link>
      </div>

      {/* 필터/정렬 바 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 rounded-lg border p-1">
          {(['latest', 'votes'] as SortOrder[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                sort === s ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              {s === 'latest' ? '최신순' : '인기순'}
            </button>
          ))}
        </div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border bg-background text-sm"
        >
          <option value="all">전체 과목</option>
          {subjects.map((s) => (
            <option key={s.slug} value={s.slug}>{s.title}</option>
          ))}
        </select>
      </div>

      {/* 문제 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">아직 문제가 없습니다.</p>
          <p className="text-sm mt-1">첫 번째 문제를 만들어보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <Link
              key={q.id}
              href={`/community/${q.id}`}
              className="block rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                      {TYPE_LABEL[q.question_type] ?? q.question_type}
                    </span>
                    {q.status === 'official' && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        공식 채택
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{q.question_text}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {q.author_display_name || '익명'} ·{' '}
                    {subjects.find((s) => s.slug === q.subject_id)?.title ?? q.subject_id}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{q.vote_count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 타입 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web
npx tsc --noEmit
```

Expected: exit 0

- [ ] **Step 4: commit**

```bash
git add src/app/community/page.tsx src/app/community/CommunityClient.tsx
git commit -m "feat(community): /community 갤러리 — 필터/정렬 UI"
```

---

### Task 5: /community/create 4단계 위저드

**Files:**
- Create: `src/app/community/create/page.tsx`
- Create: `src/app/community/create/CreateClient.tsx`

- [ ] **Step 1: RSC page.tsx 생성**

`src/app/community/create/page.tsx` — 전체:

```tsx
import { getSubjects } from '@/lib/db';
import CreateClient from './CreateClient';

export default async function CreatePage() {
  const subjects = await getSubjects();
  return (
    <CreateClient
      subjects={subjects.map((s) => ({
        slug: s.slug,
        title: s.title,
        chapters: s.chapters.map((c) => ({ slug: c.slug, title: c.title })),
      }))}
    />
  );
}
```

- [ ] **Step 2: CreateClient.tsx 생성**

`src/app/community/create/CreateClient.tsx` — 전체:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import type { CreateQuestionInput, QuestionType } from '@/types/community';

interface SubjectOption {
  slug: string;
  title: string;
  chapters: { slug: string; title: string }[];
}

interface Props {
  subjects: SubjectOption[];
}

interface WizardState {
  step: 1 | 2 | 3 | 4;
  subjectId: string;
  chapterId: string | null;
  questionType: QuestionType;
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: string;
  explanation: string;
}

const INITIAL: WizardState = {
  step: 1,
  subjectId: '',
  chapterId: null,
  questionType: 'multiple',
  questionText: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  explanation: '',
};

const STEP_LABELS = ['과목 선택', '문제 입력', '정답 작성', '미리보기'];

const TYPE_LABEL: Record<QuestionType, string> = {
  multiple: '객관식',
  ox: 'OX 퀴즈',
  fill_in: '빈칸 채우기',
  descriptive: '서술형',
};

export default function CreateClient({ subjects }: Props) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>(INITIAL);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login?redirect=/community/create');
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">인증 확인 중...</p>
      </div>
    );
  }

  const selectedSubject = subjects.find((s) => s.slug === state.subjectId);

  async function handleAiAssist() {
    setAiLoading(true);
    setAiSuggestion('');
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_type: state.questionType,
          question_text: state.questionText,
          correct_answer: state.correctAnswer,
          explanation: state.explanation,
        }),
      });
      const json = await res.json();
      setAiSuggestion(json.suggestion ?? '');
    } catch {
      setAiSuggestion('AI 검증 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setSubmitError('');
    try {
      const input: CreateQuestionInput = {
        question_type: state.questionType,
        question_text: state.questionText,
        options: state.questionType === 'multiple' ? [...state.options] : null,
        correct_answer: state.correctAnswer,
        explanation: state.explanation,
        subject_id: state.subjectId,
        chapter_id: state.chapterId,
      };
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? '제출 실패');
      }
      const { id } = await res.json();
      router.push(`/community/${id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '제출 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 1: 과목/챕터 선택 ───
  function Step1() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">과목 *</label>
          <select
            value={state.subjectId}
            onChange={(e) =>
              setState((s) => ({ ...s, subjectId: e.target.value, chapterId: null }))
            }
            className="w-full px-3 py-2 rounded-lg border bg-background"
          >
            <option value="">과목을 선택하세요</option>
            {subjects.map((s) => (
              <option key={s.slug} value={s.slug}>{s.title}</option>
            ))}
          </select>
        </div>
        {selectedSubject && (
          <div>
            <label className="block text-sm font-medium mb-1.5">챕터 (선택)</label>
            <select
              value={state.chapterId ?? ''}
              onChange={(e) =>
                setState((s) => ({ ...s, chapterId: e.target.value || null }))
              }
              className="w-full px-3 py-2 rounded-lg border bg-background"
            >
              <option value="">챕터 선택 안 함</option>
              {selectedSubject.chapters.map((c) => (
                <option key={c.slug} value={c.slug}>{c.title}</option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={() => setState((s) => ({ ...s, step: 2 }))}
          disabled={!state.subjectId}
          className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    );
  }

  // ─── Step 2: 문제 유형 + 본문 ───
  function Step2() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">문제 유형 *</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TYPE_LABEL) as QuestionType[]).map((type) => (
              <button
                key={type}
                onClick={() => setState((s) => ({ ...s, questionType: type }))}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  state.questionType === type
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
              >
                {TYPE_LABEL[type]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">문제 본문 *</label>
          <textarea
            value={state.questionText}
            onChange={(e) => setState((s) => ({ ...s, questionText: e.target.value }))}
            placeholder="문제를 입력하세요..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg border bg-background resize-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setState((s) => ({ ...s, step: 1 }))}
            className="flex-1 py-2 rounded-lg border font-medium text-sm"
          >
            이전
          </button>
          <button
            onClick={() => setState((s) => ({ ...s, step: 3 }))}
            disabled={!state.questionText.trim()}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      </div>
    );
  }

  // ─── Step 3: 보기/정답/해설 ───
  function Step3() {
    return (
      <div className="space-y-4">
        {state.questionType === 'multiple' && (
          <div>
            <label className="block text-sm font-medium mb-1.5">선택지 (4개) *</label>
            {state.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <input
                  value={opt}
                  onChange={(e) => {
                    const next = [...state.options] as [string, string, string, string];
                    next[i] = e.target.value;
                    setState((s) => ({ ...s, options: next }));
                  }}
                  placeholder={`선택지 ${i + 1}`}
                  className="flex-1 px-3 py-1.5 rounded-lg border bg-background text-sm"
                />
              </div>
            ))}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1.5">정답 *</label>
          {state.questionType === 'ox' ? (
            <div className="flex gap-2">
              {['O', 'X'].map((v) => (
                <button
                  key={v}
                  onClick={() => setState((s) => ({ ...s, correctAnswer: v }))}
                  className={`flex-1 py-3 rounded-lg border font-bold text-xl transition-colors ${
                    state.correctAnswer === v
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          ) : state.questionType === 'multiple' ? (
            <div className="flex gap-2">
              {['1', '2', '3', '4'].map((v) => (
                <button
                  key={v}
                  onClick={() => setState((s) => ({ ...s, correctAnswer: v }))}
                  className={`flex-1 py-2 rounded-lg border font-medium transition-colors ${
                    state.correctAnswer === v
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  }`}
                >
                  {v}번
                </button>
              ))}
            </div>
          ) : (
            <input
              value={state.correctAnswer}
              onChange={(e) => setState((s) => ({ ...s, correctAnswer: e.target.value }))}
              placeholder="정답을 입력하세요"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">해설 (선택)</label>
          <textarea
            value={state.explanation}
            onChange={(e) => setState((s) => ({ ...s, explanation: e.target.value }))}
            placeholder="해설을 입력하세요..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border bg-background resize-none text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setState((s) => ({ ...s, step: 2 }))}
            className="flex-1 py-2 rounded-lg border font-medium text-sm"
          >
            이전
          </button>
          <button
            onClick={() => setState((s) => ({ ...s, step: 4 }))}
            disabled={!state.correctAnswer}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            미리보기
          </button>
        </div>
      </div>
    );
  }

  // ─── Step 4: 미리보기 + AI 검증 + 제출 ───
  function Step4() {
    return (
      <div className="space-y-4">
        {/* 미리보기 카드 */}
        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
              {TYPE_LABEL[state.questionType]}
            </span>
            <span className="text-xs text-muted-foreground">
              {subjects.find((s) => s.slug === state.subjectId)?.title}
            </span>
          </div>
          <p className="text-sm font-medium whitespace-pre-wrap">{state.questionText}</p>
          {state.questionType === 'multiple' && (
            <ol className="space-y-1">
              {state.options.map((opt, i) => (
                <li
                  key={i}
                  className={`text-sm px-3 py-1.5 rounded-lg ${
                    state.correctAnswer === String(i + 1)
                      ? 'bg-green-100 dark:bg-green-900/30 font-medium'
                      : ''
                  }`}
                >
                  {i + 1}. {opt}
                </li>
              ))}
            </ol>
          )}
          <p className="text-sm">
            <span className="font-medium">정답: </span>
            {state.questionType === 'multiple' ? `${state.correctAnswer}번` : state.correctAnswer}
          </p>
          {state.explanation && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">해설: </span>
              {state.explanation}
            </p>
          )}
        </div>

        {/* AI 검증 */}
        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">AI 검증 (선택)</p>
            <button
              onClick={handleAiAssist}
              disabled={aiLoading}
              className="text-xs px-3 py-1 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50"
            >
              {aiLoading ? '검증 중...' : 'AI로 검증하기'}
            </button>
          </div>
          {aiSuggestion && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiSuggestion}</p>
          )}
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <div className="flex gap-2">
          <button
            onClick={() => setState((s) => ({ ...s, step: 3 }))}
            className="flex-1 py-2 rounded-lg border font-medium text-sm"
          >
            이전
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50"
          >
            {loading ? '제출 중...' : '문제 제출'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">문제 만들기</h1>
      <p className="text-sm text-muted-foreground mb-6">
        특수교육 문제를 제작하고 커뮤니티와 공유하세요.
      </p>

      {/* 진행 표시 */}
      <div className="flex gap-1 mb-8">
        {STEP_LABELS.map((label, i) => {
          const stepNum = (i + 1) as 1 | 2 | 3 | 4;
          const active = state.step === stepNum;
          const done = state.step > stepNum;
          return (
            <div key={i} className="flex-1 text-center">
              <div
                className={`h-1.5 rounded-full mb-1 ${
                  done ? 'bg-primary' : active ? 'bg-primary/60' : 'bg-muted'
                }`}
              />
              <span
                className={`text-xs ${
                  active || done ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {state.step === 1 && <Step1 />}
      {state.step === 2 && <Step2 />}
      {state.step === 3 && <Step3 />}
      {state.step === 4 && <Step4 />}
    </div>
  );
}
```

- [ ] **Step 3: 타입 확인**

```bash
npx tsc --noEmit
```

Expected: exit 0

- [ ] **Step 4: commit**

```bash
git add src/app/community/create/page.tsx src/app/community/create/CreateClient.tsx
git commit -m "feat(community): /community/create 4단계 위저드 — 과목/유형/정답/미리보기"
```

---

## Chunk 3: Detail + API Routes + Integration

### Task 6: /api/community 문제 제출 API

**Files:**
- Create: `src/app/api/community/route.ts`

- [ ] **Step 1: route.ts 생성**

`src/app/api/community/route.ts` — 전체:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCommunityQuestion } from '@/lib/community-db';
import type { CreateQuestionInput } from '@/types/community';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const ALLOWED_TYPES = ['multiple', 'ox', 'fill_in', 'descriptive'];

  if (!ALLOWED_TYPES.includes(String(input.question_type ?? ''))) {
    return NextResponse.json({ error: '유효하지 않은 문제 유형입니다.' }, { status: 400 });
  }
  if (!input.question_text || typeof input.question_text !== 'string' || !input.question_text.trim()) {
    return NextResponse.json({ error: '문제 본문을 입력하세요.' }, { status: 400 });
  }
  if (!input.correct_answer || typeof input.correct_answer !== 'string') {
    return NextResponse.json({ error: '정답을 입력하세요.' }, { status: 400 });
  }
  if (!input.subject_id || typeof input.subject_id !== 'string') {
    return NextResponse.json({ error: '과목을 선택하세요.' }, { status: 400 });
  }

  // 표시명 조회: nickname → display_name → email prefix
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, nickname')
    .eq('id', user.id)
    .single();
  type ProfileRow = { display_name?: string; nickname?: string } | null;
  const authorDisplayName =
    (profile as ProfileRow)?.nickname ||
    (profile as ProfileRow)?.display_name ||
    user.email?.split('@')[0] ||
    '익명';

  const questionInput: CreateQuestionInput = {
    question_type: input.question_type as CreateQuestionInput['question_type'],
    question_text: (input.question_text as string).trim(),
    options: Array.isArray(input.options) ? (input.options as string[]) : null,
    correct_answer: (input.correct_answer as string).trim(),
    explanation: typeof input.explanation === 'string' ? input.explanation.trim() : '',
    subject_id: (input.subject_id as string).trim(),
    chapter_id:
      typeof input.chapter_id === 'string' ? input.chapter_id.trim() || null : null,
  };

  const result = await createCommunityQuestion(questionInput, user.id, authorDisplayName);
  if (!result) {
    return NextResponse.json({ error: '문제 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
  return NextResponse.json({ id: result.id }, { status: 201 });
}
```

- [ ] **Step 2: commit**

```bash
git add src/app/api/community/route.ts
git commit -m "feat(community): POST /api/community — 문제 제출 API (인증 + 유효성 검사)"
```

---

### Task 7: /community/[id] 상세 페이지

**Files:**
- Create: `src/app/community/[id]/page.tsx`
- Create: `src/app/community/[id]/QuestionDetailClient.tsx`

- [ ] **Step 1: RSC page.tsx 생성**

`src/app/community/[id]/page.tsx` — 전체:

```tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCommunityQuestionById, getUserVoteForQuestion } from '@/lib/community-db';
import { getSubjects } from '@/lib/db';
import QuestionDetailClient from './QuestionDetailClient';
import type { CommunityQuestionDetail } from '@/types/community';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CommunityDetailPage({ params }: Props) {
  const { id } = await params;
  const [question, subjects] = await Promise.all([
    getCommunityQuestionById(id),
    getSubjects(),
  ]);
  if (!question) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userVote = user ? await getUserVoteForQuestion(id, user.id) : null;

  const detail: CommunityQuestionDetail = { ...question, user_vote: userVote };
  return (
    <QuestionDetailClient
      question={detail}
      isOwner={user?.id === question.author_id}
      subjects={subjects.map((s) => ({ slug: s.slug, title: s.title }))}
    />
  );
}
```

- [ ] **Step 2: QuestionDetailClient.tsx 생성**

`src/app/community/[id]/QuestionDetailClient.tsx` — 전체:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, CheckCircle2, ArrowLeft } from 'lucide-react';
import type { CommunityQuestionDetail, VoteType } from '@/types/community';

interface Props {
  question: CommunityQuestionDetail;
  isOwner: boolean;
  subjects: { slug: string; title: string }[];
}

const TYPE_LABEL: Record<string, string> = {
  multiple: '객관식',
  ox: 'OX',
  fill_in: '빈칸',
  descriptive: '서술형',
};

export default function QuestionDetailClient({ question, isOwner, subjects }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [voteCount, setVoteCount] = useState(question.vote_count);
  const [userVote, setUserVote] = useState<VoteType | null>(question.user_vote);
  const [voteLoading, setVoteLoading] = useState(false);

  async function handleVote(type: VoteType) {
    if (isOwner) return;
    setVoteLoading(true);
    const nextVote: VoteType | null = userVote === type ? null : type;
    try {
      const res = await fetch(`/api/community/${question.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: nextVote }),
      });
      if (res.ok) {
        // 낙관적 업데이트: up 투표만 카운트에 반영
        const getUpDelta = (prev: VoteType | null, next: VoteType | null) => {
          if (prev === 'up' && next === null) return -1;
          if (prev !== 'up' && next === 'up') return 1;
          if (prev === 'up' && next === 'down') return -1;
          return 0;
        };
        setVoteCount((c) => c + getUpDelta(userVote, nextVote));
        setUserVote(nextVote);
      }
    } finally {
      setVoteLoading(false);
    }
  }

  const isCorrect = revealed && selected === question.correct_answer;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/community"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        커뮤니티로
      </Link>

      {/* 메타 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
          {TYPE_LABEL[question.question_type] ?? question.question_type}
        </span>
        {question.status === 'official' && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            공식 채택
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {question.author_display_name || '익명'} ·{' '}
          {subjects.find((s) => s.slug === question.subject_id)?.title ?? question.subject_id}
        </span>
      </div>

      {/* 문제 */}
      <div className="rounded-xl border bg-card p-5 mb-4">
        <p className="font-medium whitespace-pre-wrap">{question.question_text}</p>
      </div>

      {/* 객관식 선택지 */}
      {question.question_type === 'multiple' && question.options && (
        <div className="space-y-2 mb-4">
          {question.options.map((opt, i) => {
            const val = String(i + 1);
            const isRight = revealed && val === question.correct_answer;
            const isWrong = revealed && selected === val && !isRight;
            return (
              <button
                key={i}
                onClick={() => {
                  setSelected(val);
                  setRevealed(false);
                }}
                disabled={revealed}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  isRight
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isWrong
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : selected === val
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted'
                }`}
              >
                {i + 1}. {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* OX 선택 */}
      {question.question_type === 'ox' && (
        <div className="flex gap-3 mb-4">
          {['O', 'X'].map((v) => {
            const isRight = revealed && v === question.correct_answer;
            const isWrong = revealed && selected === v && !isRight;
            return (
              <button
                key={v}
                onClick={() => {
                  setSelected(v);
                  setRevealed(false);
                }}
                disabled={revealed}
                className={`flex-1 py-4 rounded-xl border text-2xl font-bold transition-colors ${
                  isRight
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700'
                    : isWrong
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700'
                    : selected === v
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted'
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>
      )}

      {/* 정답 확인 버튼 */}
      {(question.question_type === 'multiple' || question.question_type === 'ox') &&
        selected &&
        !revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-2 mb-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
          >
            정답 확인
          </button>
        )}

      {/* 정답/해설 */}
      {(revealed ||
        question.question_type === 'fill_in' ||
        question.question_type === 'descriptive') && (
        <div
          className={`rounded-xl border p-4 mb-4 ${
            revealed && isCorrect
              ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
              : revealed
              ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
              : 'bg-muted/30'
          }`}
        >
          {revealed && (
            <p
              className={`font-bold mb-1 ${
                isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}
            >
              {isCorrect ? '정답입니다!' : '오답입니다.'}
            </p>
          )}
          <p className="text-sm">
            <span className="font-medium">정답: </span>
            {question.correct_answer}
          </p>
          {question.explanation && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground">해설: </span>
              {question.explanation}
            </p>
          )}
        </div>
      )}

      {/* 투표 */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <p className="text-sm text-muted-foreground flex-1">
          이 문제가 도움이 됐나요?
          {isOwner && (
            <span className="ml-1 text-xs">(본인 문제는 투표할 수 없습니다)</span>
          )}
        </p>
        <button
          onClick={() => handleVote('up')}
          disabled={voteLoading || isOwner}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors disabled:opacity-50 ${
            userVote === 'up'
              ? 'bg-primary/10 border-primary text-primary'
              : 'hover:bg-muted'
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          {voteCount}
        </button>
        <button
          onClick={() => handleVote('down')}
          disabled={voteLoading || isOwner}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors disabled:opacity-50 ${
            userVote === 'down'
              ? 'bg-destructive/10 border-destructive text-destructive'
              : 'hover:bg-muted'
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 타입 확인**

```bash
npx tsc --noEmit
```

Expected: exit 0

- [ ] **Step 4: commit**

```bash
git add src/app/community/[id]/page.tsx src/app/community/[id]/QuestionDetailClient.tsx
git commit -m "feat(community): /community/[id] 상세 — 풀어보기 + 투표 UI"
```

---

### Task 8: Vote API + AI Assist stub

**Files:**
- Create: `src/app/api/community/[id]/vote/route.ts`
- Create: `src/app/api/ai-assist/route.ts`

- [ ] **Step 1: Vote API 생성**

`src/app/api/community/[id]/vote/route.ts` — 전체:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { setVote } from '@/lib/community-db';
import type { VoteType } from '@/types/community';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const { id: questionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  // 본인 문제 투표 차단
  const { data: question } = await supabase
    .from('community_questions')
    .select('author_id')
    .eq('id', questionId)
    .single();
  if (!question) {
    return NextResponse.json({ error: '문제를 찾을 수 없습니다.' }, { status: 404 });
  }
  if ((question as { author_id: string }).author_id === user.id) {
    return NextResponse.json(
      { error: '본인 문제에는 투표할 수 없습니다.' },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const voteType = (body as Record<string, unknown>).vote_type as VoteType | null;
  const { error } = await setVote(questionId, user.id, voteType ?? null);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: AI Assist stub 생성**

`src/app/api/ai-assist/route.ts` — 전체:

```typescript
import { NextResponse } from 'next/server';

const MOCK_SUGGESTIONS = [
  '문제 본문이 명확합니다. 선택지 간 난이도 차이를 고려해보세요.',
  '정답과 오답지의 길이가 비슷한지 확인해보세요 (길이 단서 방지).',
  '해설에 관련 법령이나 이론적 근거를 추가하면 학습에 도움이 됩니다.',
  '문제가 특수교육 현장과 관련이 높습니다. 좋은 문제입니다!',
  '빈칸 답이 너무 짧으면 단어 암기 문제가 됩니다. 개념 설명 형태를 고려해보세요.',
];

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    // TODO: Gemini Flash 실제 연동
    // const suggestion = await callGeminiFlash(apiKey, body);
    // return NextResponse.json({ suggestion });
    void body; // 미사용 경고 방지
  }

  // Mock 응답 (키 없거나 미구현)
  const suggestion = MOCK_SUGGESTIONS[Math.floor(Math.random() * MOCK_SUGGESTIONS.length)];
  return NextResponse.json({ suggestion, mock: !apiKey });
}
```

- [ ] **Step 3: commit**

```bash
git add src/app/api/community/[id]/vote/route.ts src/app/api/ai-assist/route.ts
git commit -m "feat(community): 투표 API + AI 어시스턴트 stub (GEMINI_API_KEY 없으면 mock)"
```

---

### Task 9: Header 네비게이션 + 최종 빌드

**Files:**
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: navLinks에 /community 추가, /structure 제거**

`src/components/layout/Header.tsx`의 `navLinks` 배열:

기존:
```typescript
const navLinks = [
  { href: '/kice', label: '기출' },
  { href: '/analytics', label: '출제경향' },
  { href: '/structure', label: '구조도' },
  { href: '/wrong-notes', label: '오답노트' },
  { href: '/stats', label: '통계' },
];
```

변경:
```typescript
const navLinks = [
  { href: '/kice', label: '기출' },
  { href: '/analytics', label: '출제경향' },
  { href: '/community', label: '커뮤니티' },
  { href: '/wrong-notes', label: '오답노트' },
  { href: '/stats', label: '통계' },
];
```

> 주의: `/structure`는 Plan B(권한 시스템) 완료 후 admin 전용으로 제한되므로, 범용 nav에서 제거한다.

- [ ] **Step 2: 최종 빌드 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web
npx tsc --noEmit && npx next build
```

Expected: exit 0, Route 출력에 `/community`, `/community/create`, `/community/[id]` 포함

- [ ] **Step 3: 테스트 전체 실행**

```bash
npx vitest run
```

Expected: 기존 테스트 포함 전부 PASS (community-db.test.ts 7건 포함)

- [ ] **Step 4: commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat(community): 헤더 커뮤니티 링크 추가, /structure 제거(admin-only 예정)"
```

---

## 수동 검증 체크리스트

```bash
npm run dev
```

1. `/community` — 갤러리 렌더링, 최신순/인기순 정렬, 과목 필터 동작
2. `/community/create` — 비로그인 시 `/login` 리다이렉트 확인
3. 로그인 후 `/community/create` — 4단계 완주 → 제출 → `/community/[id]` 이동
4. `/community/[id]` — OX/객관식 풀기, 정답 확인 색상 피드백
5. 본인 문제 상세 — 투표 버튼 비활성화 (`isOwner = true`)
6. 타인 문제 상세 — ThumbsUp 클릭 → 낙관적 카운트 +1 → 같은 버튼 재클릭 → 카운트 -1 (toggle-off)
7. Step 4 AI 버튼 → mock 응답 표시 확인 (GEMINI_API_KEY 없을 때)
