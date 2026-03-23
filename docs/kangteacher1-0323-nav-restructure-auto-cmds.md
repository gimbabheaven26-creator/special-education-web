# 강선생1 지시서 — 메인 네비게이션 구조 개편

날짜: 2026-03-23
작성: 스미스 프라임
대상: 강선생1 (~/Projects/special-education-web)

---

## 배경

카이란 요청: 메인 네비게이션을 문제 유형 중심으로 재편.
- 오늘학습(/daily)은 홈 메인 버튼에서만 진입 → 네비에서 제거
- OX퀴즈/단답형을 별도 페이지로 신설 → 진단평가 탭에 추가
- 모의고사+워크시트를 묶는 "문제풀기" 허브 페이지 → 실력쌓기 탭 하위에 추가

---

## 현재 상태

### nav-config.ts 현재 구조 (`src/lib/nav-config.ts`)
```
진단평가: 오늘학습(/daily) | 워크시트(/worksheets) | 용어학습(/terms)
실력쌓기: 개념학습(/concepts) | 모의고사(/kice/exam) | 인터랙티브(/interactive)
내 기록: 마스터리 트리 | 학습통계 | 북마크 | 출제경향 | 오답노트 | 플래시카드
함께하기: 커뮤니티 | 리뷰 | BDS 시나리오
```

### 변경 후 목표 구조
```
진단평가: OX퀴즈(/quiz/ox) | 단답형(/quiz/short) | 용어학습(/terms)
실력쌓기: 개념학습(/concepts) | 문제풀기(/practice) | 인터랙티브(/interactive)
내 기록: 그대로
함께하기: 그대로
```

### 관련 타입 (`src/types/quiz.ts` line 1)
```typescript
export type QuizType = 'multiple' | 'ox' | 'fill_in' | 'descriptive' | 'scenario_composite';
```
- OX퀴즈 → type = `'ox'`
- 단답형 → type = `'fill_in'`

### DB 함수 현황 (`src/lib/db.ts`)
- `getQuizzesBySubject(subjectSlug)` — 과목별 fetch (있음)
- `getAllQuizzes()` — 전체 fetch (있음, line 95)
- `getQuizzesByType(type)` — **없음, 신규 추가 필요**
- `mapQuizRow` — DB row → QuizQuestion 변환 (line 108)

### 기존 퀴즈 페이지 참고 (`src/app/quiz/[subject]/page.tsx`)
```tsx
<QuizClient
  subjectSlug={subjectSlug}
  subjectTitle={subject.title}
  questions={questions}
  chapterMap={chapterMap}  // { [chapterSlug]: chapterTitle }
/>
```

---

## Step 1 — db.ts에 getQuizzesByType 함수 추가

```
/auto --mode feature db.ts에 getQuizzesByType 함수 추가

[구현 대상]
src/lib/db.ts — getAllQuizzes 함수(line 95) 아래에 추가:

export async function getQuizzesByType(type: QuizType): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('type', type)
    .limit(10000);
  if (error || !data) return [];
  return data.map(mapQuizRow);
}

import 추가: QuizType을 '@/types/quiz'에서 import

[검증 항목]
- pnpm build 에러 없음
- TypeScript 타입 에러 없음

[커밋 메시지]
feat(db): getQuizzesByType 함수 추가 — type별 문제 전체 fetch
```

---

## Step 2 — OX퀴즈/단답형/문제풀기 페이지 신규 생성 (Step 1 완료 후)

```
/auto --mode feature OX퀴즈 단답형 문제풀기 허브 페이지 신규 생성

[구현 대상 - 3개 파일 병렬 생성]

1. src/app/quiz/ox/page.tsx (신규)
   - export const dynamic = 'force-dynamic'
   - getQuizzesByType('ox')로 문제 fetch
   - getSubjects()로 전체 과목 fetch → chapterMap 빌드
     (subject.chapters를 순회해 { [ch.slug]: ch.title } 맵 생성)
   - <QuizClient subjectSlug="ox" subjectTitle="OX 퀴즈" questions={questions} chapterMap={chapterMap} />
   - metadata: title='OX 퀴즈', description='전 과목 OX 문제 모아 풀기'

2. src/app/quiz/short/page.tsx (신규)
   - export const dynamic = 'force-dynamic'
   - getQuizzesByType('fill_in')로 문제 fetch
   - 동일하게 chapterMap 빌드
   - <QuizClient subjectSlug="short" subjectTitle="단답형" questions={questions} chapterMap={chapterMap} />
   - metadata: title='단답형', description='전 과목 단답형 문제 모아 풀기'

3. src/app/practice/page.tsx (신규)
   - 'force-static'
   - 모의고사(/kice/exam)와 워크시트(/worksheets) 두 카드를 나란히 보여주는 허브 페이지
   - 각 카드: 제목, 한 줄 설명, 아이콘, Link로 각 경로 이동
   - metadata: title='문제풀기', description='모의고사와 워크시트로 실전 대비'

[검증 항목]
- pnpm build 에러 없음
- /quiz/ox 접속 → OX 문제 목록 표시
- /quiz/short 접속 → 단답형 문제 목록 표시
- /practice 접속 → 모의고사/워크시트 카드 2개 표시

[커밋 메시지]
feat(quiz): OX퀴즈/단답형/문제풀기 허브 페이지 신규 생성
```

---

## Step 3 — nav-config.ts 재구성 (Step 2 완료 후)

```
/auto --mode refactor nav-config.ts 네비게이션 구조 재편

[구현 대상]
src/lib/nav-config.ts — NAV_GROUPS 배열을 아래와 같이 교체:

진단평가 그룹:
  - { href: '/quiz/ox', label: 'OX 퀴즈', description: '전 과목 OX 문제' }
  - { href: '/quiz/short', label: '단답형', description: '전 과목 단답형 문제' }
  - { href: '/terms', label: '용어학습', description: '핵심 용어 플래시카드' }
  (기존 /daily, /worksheets 항목 제거)

실력쌓기 그룹:
  - { href: '/concepts', label: '개념학습', description: '과목별 핵심 개념 정리' }
  - { href: '/practice', label: '문제풀기', description: '모의고사·워크시트 실전 대비' }
  - { href: '/interactive', label: '인터랙티브' }
  (기존 /kice/exam 항목 제거 — /practice 하위로 이동됨)

내 기록 그룹: 변경 없음
함께하기 그룹: 변경 없음

[검증 항목]
- pnpm build 에러 없음
- 홈 메인 "오늘 학습 시작하기" 버튼 → /daily 정상 이동 확인 (홈에서만 접근 가능)
- 상단 네비 "진단평가" 드롭다운 → OX퀴즈 | 단답형 | 용어학습
- 상단 네비 "실력쌓기" 드롭다운 → 개념학습 | 문제풀기 | 인터랙티브
- 모바일 하단 탭바 서브 스트립 정상 표시

[커밋 메시지]
refactor(nav): 네비게이션 구조 재편 — 오늘학습 제거, OX/단답형/문제풀기 허브 추가
```

---

## 완료 기준

- [x] `npm run build` 성공 (186페이지 OK)
- [x] 커밋 3개 — 932e678 (db) / 9f62af5 (pages) / 30b721d (nav)
- [x] `main` 브랜치 push 완료
- [ ] `/quiz/ox`, `/quiz/short`, `/practice` 접속 확인 (수동 필요)
- [ ] 상단 네비 + 모바일 탭바 구조 변경 확인 (수동 필요)
