# 강선생 지시서 — 진단평가 버그 수정
작성: 스미스 프라임 | 검증: 강선생 에이전트 | 날짜: 2026-03-22

> 진단평가 4개 페이지 오류 검증 결과 확인된 실사용 불가 버그 수정.
> 지시한 파일만 수정. 다른 구조(WorksheetSolver/Preview/ConfigPanel 등) 건드리지 않음.

---

## 배경 (확인된 버그)

| 버그 | 증상 | 원인 |
|------|------|------|
| 워크시트 뷰/정답 페이지 단절 | 토픽 클릭 시 항상 "학습지를 찾을 수 없습니다" | 목록은 Supabase UUID로 링크, 뷰/정답 페이지는 localStorage에서 같은 UUID 조회 → 항상 null |
| 오늘학습 비로그인 차단 | "문제를 불러오지 못했습니다" + 재시도 반복 | API가 비로그인 시 401 반환, 로그인 유도 없음 |
| 오늘학습 seed 불일치 | 자정 근처 9시간 구간에서 다른 문제 세트 | API는 UTC 날짜로 seed 생성, 클라이언트는 KST 날짜 사용 |

---

## Task 1: 워크시트 수정 (CRITICAL)

### 1-A. `src/lib/db.ts` — 함수 1개 추가

`getAllWorksheetTopics()` 함수 바로 아래에 추가:

```typescript
export async function getWorksheetTopicById(id: string): Promise<WorksheetTopicRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('worksheet_topics')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as WorksheetTopicRow;
}
```

> **주의**: `getWorksheetsByTopic(subject, topicId)` 함수는 이미 존재함 (db.ts:155).
> 새 함수 추가 없이 이것을 그대로 사용. topic에서 subject 꺼내서 호출.

---

### 1-B. `src/app/worksheets/[id]/WorksheetViewClient.tsx` — 신규 생성

정답 토글 (`useState`) + 출력 버튼 담당 클라이언트 컴포넌트:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Eye, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { WorksheetQuestionRow } from '@/lib/db';

interface WorksheetViewClientProps {
  topicName: string;
  questions: WorksheetQuestionRow[];
  qrUrl: string;
}

function QRCode({ url, size = 80 }: { url: string; size?: number }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={qrUrl} alt="QR 코드" width={size} height={size} />;
}

export default function WorksheetViewClient({ topicName, questions, qrUrl }: WorksheetViewClientProps) {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-4 print:hidden">
        <Link
          href="/worksheets"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          문제지 목록
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6 border-b border-border pb-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1 print:text-xs">{topicName}</div>
          <h1 className="text-xl font-bold text-foreground">{topicName} 학습지</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{questions.length}문제</Badge>
          </div>
        </div>
        <div className="shrink-0 ml-4 hidden sm:block">
          <QRCode url={qrUrl} size={80} />
          <p className="text-[10px] text-muted-foreground text-center mt-1">정답 QR</p>
        </div>
      </div>

      <div className="space-y-6 print:space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold text-foreground print:bg-transparent print:border print:border-foreground/30">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {q.type === 'fill_in' ? '기입형 (2점)' : '서술형 (4점)'}
                </Badge>
              </div>
              <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap print:text-sm">
                {q.question}
              </p>
              {!showAnswers && q.type === 'fill_in' && (
                <div className="mt-3 border-b-2 border-dashed border-foreground/30 w-full max-w-64 h-8" />
              )}
              {!showAnswers && q.type === 'descriptive' && (
                <div className="mt-3 space-y-3">
                  {[1, 2, 3, 4, 5].map((line) => (
                    <div key={line} className="border-b border-dashed border-foreground/20 h-6" />
                  ))}
                </div>
              )}
              {showAnswers && (
                <div className="mt-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">정답</p>
                  <p className="text-sm text-green-700 dark:text-green-400">{q.answer}</p>
                  {q.explanation && (
                    <>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 mt-3 mb-1">해설</p>
                      <p className="text-sm text-green-700 dark:text-green-400">{q.explanation}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden print:block mt-8 pt-4 border-t border-foreground/20 text-center text-xs text-foreground/50">
        &#x26A0;&#xFE0F; 용어 검증 필요 | special-education-web
      </div>

      <div className="flex flex-wrap gap-3 mt-8 print:hidden">
        <Button onClick={() => window.print()} variant="outline" className="min-h-[44px]">
          <Printer className="h-4 w-4 mr-2" />
          출력하기
        </Button>
        <Button onClick={() => setShowAnswers(!showAnswers)} variant="outline" className="min-h-[44px]">
          <Eye className="h-4 w-4 mr-2" />
          {showAnswers ? '정답 숨기기' : '정답보기'}
        </Button>
        <Link href="/worksheets">
          <Button variant="outline" className="min-h-[44px]">
            <RefreshCw className="h-4 w-4 mr-2" />
            다른 문제지
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

---

### 1-C. `src/app/worksheets/[id]/page.tsx` — 서버 컴포넌트로 전환

기존 파일 전체를 아래로 교체:

```typescript
import { notFound } from 'next/navigation';
import { getWorksheetTopicById, getWorksheetsByTopic } from '@/lib/db';
import WorksheetViewClient from './WorksheetViewClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://special-education-web.vercel.app';

export default async function WorksheetViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const topic = await getWorksheetTopicById(id);
  if (!topic) notFound();

  const questions = await getWorksheetsByTopic(topic.subject, id);
  const qrUrl = `${SITE_URL}/worksheets/${id}`;

  return (
    <WorksheetViewClient
      topicName={topic.name}
      questions={questions}
      qrUrl={qrUrl}
    />
  );
}
```

---

### 1-D. `src/app/worksheets/[id]/answers/page.tsx` — 동일하게 서버 컴포넌트 전환

이 파일도 같은 `loadWorksheet` 문제. 기존 파일 전체를 아래로 교체:

```typescript
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getWorksheetTopicById, getWorksheetsByTopic } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default async function WorksheetAnswersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const topic = await getWorksheetTopicById(id);
  if (!topic) notFound();

  const questions = await getWorksheetsByTopic(topic.subject, id);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-4 print:hidden">
        <Link
          href="/worksheets"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          문제지 목록
        </Link>
      </div>

      <div className="mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h1 className="text-xl font-bold text-foreground">정답 및 해설</h1>
        </div>
        <div className="text-sm text-muted-foreground mb-1">{topic.name}</div>
        <Badge variant="outline">{questions.length}문제</Badge>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="border border-border rounded-lg p-4 print:border-foreground/20"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center text-sm font-bold text-green-700 dark:text-green-400">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {q.type === 'fill_in' ? '기입형 (2점)' : '서술형 (4점)'}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap mb-3">
                  {q.question}
                </p>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 mb-2">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">정답</p>
                  <p className="text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap">{q.answer}</p>
                </div>
                {q.explanation && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">해설</p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 whitespace-pre-wrap">{q.explanation}</p>
                  </div>
                )}
                {q.source && (
                  <p className="mt-2 text-xs text-muted-foreground">출처: {q.source}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden print:block mt-8 pt-4 border-t border-foreground/20 text-center text-xs text-foreground/50">
        &#x26A0;&#xFE0F; 용어 검증 필요 | special-education-web
      </div>

      <div className="flex flex-wrap gap-3 mt-8 print:hidden">
        <Link href="/worksheets">
          <Button variant="outline" className="min-h-[44px]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            문제지 목록
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

---

## Task 2: 오늘학습 수정 (HIGH)

### 2-A. `src/app/api/daily-questions/route.ts` — 인증 제거 + KST seed

**변경 1**: `getUser()` + 401 블록 제거 (2줄 삭제)
**변경 2**: UTC seed → KST seed 교체

현재 라인 19~33:
```typescript
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();   // ← 삭제
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });  // ← 삭제

  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, type, question, answer, chapter, subject, explanation')
    .in('type', ['ox', 'fill_in', 'descriptive']);

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);   // ← UTC, 교체
```

수정 후:
```typescript
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, type, question, answer, chapter, subject, explanation')
    .in('type', ['ox', 'fill_in', 'descriptive']);

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());  // ← KST
```

나머지 로직은 그대로 유지.

---

## 완료 조건

```bash
npx tsc --noEmit   # 에러 0건
npm run build      # exit 0
```

수동 확인:
- `/worksheets` 목록 → 토픽 클릭 → 문제지 정상 표시 (더 이상 "찾을 수 없습니다" 아님)
- `/worksheets/[id]/answers` 직접 접근 → 정답/해설 정상 표시
- 비로그인 상태 `/daily` → 문제 정상 로드

---

## 커밋 메시지

```
fix(worksheets): Supabase 직접 조회로 뷰·정답 페이지 플로우 복구
fix(daily): 비로그인 허용 + seed를 UTC→KST로 통일
```

별도 커밋 2개 권장.

---

## 완료 메모 (강선생이 작업 후 여기에 기록)

```
완료 날짜:
완료한 것:
빌드 상태:
특이사항:
```
