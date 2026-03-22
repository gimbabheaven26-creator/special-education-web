# 강선생 지시서
작성: 스미스 프라임 | 날짜: 2026-03-19 (세션 3) | 대상: 강선생 Opus + Sonnet
> ✅ 세션 1 완료 (Reviews 관리자 시스템 + Auth 골격)
> ✅ 세션 2 완료 (홈 화면 Daily Loop + Plan D: Gemini AI / ExamCountdown / WrongNoteAI)

---

## Opus 세션 할 일 — 홈 화면 일일 루프 재설계 [우선순위: 긴급]

**배경**
현재 홈 화면에 "오늘 뭘 해야 하는지" 전혀 안 보임.
말해보카 핵심 인사이트: "일일 루프가 DAU를 만든다."
SRS/Leitner 데이터는 이미 있다 — 홈에서 보여주기만 하면 됨.

**구현 내용**

### 1. 홈 화면 Daily Loop 섹션 (최상단 배치)

`src/app/page.tsx` 또는 홈 클라이언트 컴포넌트에 추가:

```
┌─────────────────────────────────┐
│ 🔥 오늘의 복습  스트릭 N일째    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  복습 카드  N장    오늘 완료 N장 │
│  [지금 복습하기 →]              │
└─────────────────────────────────┘
```

- **SRS 카드 수**: `useLeitnerStore`에서 오늘 due 카드 수 계산
- **완료 판정**: 오늘 날짜의 due 카드가 0이면 "✓ 오늘 복습 완료!"
- **CTA 버튼**: `/flashcards` 링크 (due 카드부터 시작)
- **스트릭**: `useStudyStore`에서 현재 streak 값

### 2. 오늘의 추천 과목 (Daily Loop 아래)

오답 데이터에서 최근 7일 오답률 상위 챕터 1~2개 노출:
```
📌 오늘 집중 추천: 행동지원 > 기능적 행동평가
   최근 7일 오답률 72% — 복습하러 가기 →
```

### 3. ExamCountdown 통합

홈 화면 상단 Daily Loop 섹션 바로 위에 배치.
`src/components/ExamCountdown.tsx` — Sonnet 세션에서 생성 예정.
시험일 미설정 시 배너 숨김.

**완료 조건**
- 홈 화면 접속 시 오늘 복습 카드 수 표시
- due 0이면 완료 메시지
- `npm run build` exit 0

**완료 후**: 이 파일 하단 "Opus 완료 메모"에 결과 기록

---

## Sonnet 세션 할 일 — Plan D 병렬 구현

**전제**: Opus가 홈 화면 Daily Loop 완료 후 시작.
(또는 독립적이므로 동시 진행 가능)

### 병렬 Agent 3개 동시 실행

**Agent 1 — Gemini AI 어시스턴트 실제 연결**

참고: `docs/superpowers/plans/2026-03-18-ai-planner.md` Chunk 1

1. `npm install @google/generative-ai`
2. `src/app/api/community/ai-assist/route.ts` — mock 제거 + 실제 Gemini 1.5-flash 호출
3. `npm run build` 확인 후 커밋 `feat(ai): Gemini 1.5-flash 연결 — 커뮤니티 AI 어시스턴트`

**Agent 2 — ExamCountdown D-day 플래너**

참고: `docs/superpowers/plans/2026-03-18-ai-planner.md` Chunk 2

1. `src/store/useStudyStore.ts` — `examDate` 필드 추가 (persist 포함)
2. `src/components/ExamCountdown.tsx` — D-day 카운트다운 컴포넌트 생성
3. `src/app/my/page.tsx` — ExamCountdown 추가
4. `npm run build` 확인 후 커밋 `feat(planner): D-day 카운트다운 — /my 시험일 설정`

**Agent 3 — WrongNoteAI 약점 분석**

참고: `docs/superpowers/plans/2026-03-18-ai-planner.md` Chunk 3

1. `src/app/api/ai/weakness/route.ts` — Gemini 약점 분석 API 신규
2. `src/components/WrongNoteAI.tsx` — 분석하기 버튼 + 결과 컴포넌트
3. 오답노트 페이지에 WrongNoteAI 통합
4. `npm run build` 확인 후 커밋 `feat(ai): 오답노트 AI 약점 분석 — Gemini 기반 취약 챕터 + 학습 전략`

**Agent 완료 후**: `npm run build` 전체 확인 → PASS → 완료 커밋

---

## Opus 완료 메모 (세션 2)

```
완료 날짜:
완료한 것:
빌드 상태:
Sonnet에게 인계:
주의사항:
```

---

## 세션 3 — Opus: 홈 화면 "오늘의 문제" 섹션 설계 + 구현

### 배경

홈 화면 퀴즈 노출 구조 확정:

```
[ExamCountdown]  D-421 (2026-11-21 하드코딩)
[Daily Loop]     SRS 복습 카드 + 스트릭 ← 이미 완료
─────────────────────────────────────────
[오늘의 문제]
  ① OX 퀴즈    10개
  ② 단답형      5개
  ③ 문장형      3개
─────────────────────────────────────────
[모의고사 풀기]  출력형 (일일수학 B 스타일) ← 나중
[기출문제]       메뉴에서 숨김
```

### Opus 판단 사항

**1. "오늘의 문제" 선택 알고리즘 설계**

아래 중 가장 학습 효과가 좋은 방식으로 판단 후 구현:
- Option A: 순수 랜덤 (구현 단순, 학습 효과 낮음)
- Option B: 오답노트 우선 (틀린 문제 먼저) + 부족하면 랜덤 채움
- Option C: 미시도 문제 우선 + 오답 + 랜덤 혼합

추천: Option B 또는 C. 이유 있으면 완료 메모에 기록.

**2. HomeQuizSection 컴포넌트 신규 생성**

- `src/components/HomeQuizSection.tsx`
- OX / 단답형 / 문장형 각 타입별로 DB 쿼리 → 타입 필터링
- 로딩 스켈레톤 처리 (데이터 없으면 "오늘의 문제 준비 중..." 표시)

**UX: 문제지 + 답안 보기 (일일수학 B 스타일)**

```
┌─────────────────────────────────────────┐
│  오늘의 문제                [답안 보기 ▼] │
├─────────────────────────────────────────┤
│  [OX] 1. 통합교육에서 ...                │
│  [OX] 2. 행동지원 계획은 ...             │
│  ...                                    │
│  [단답] 11. 기능적 행동평가란 ...         │
│  ...                                    │
│  [서술] 16. 다음 상황에서 교사가 ...      │
│  ...                                    │
└─────────────────────────────────────────┘

[답안 보기] 클릭 시 → 표 형태로 토글:

┌────┬──────┬──────────────────┐
│ 번호 │ 유형 │ 정답             │
├────┼──────┼──────────────────┤
│  1  │  OX  │ O                │
│  2  │  OX  │ X                │
│ 11  │ 단답 │ 기능적 행동평가   │
│ 16  │ 서술 │ 핵심 키워드: ...  │
└────┴──────┴──────────────────┘
```

- "답안 보기" 버튼: 섹션 우상단에 1개 (전체 답안 토글)
- 토글 상태: "답안 보기 ▼" ↔ "답안 닫기 ▲"
- 서술형 정답: 전체 문장 대신 핵심 키워드만 표시 (채점 가이드 축약)
- 문제 클릭 불가 (홈에서는 읽기 전용) — 더 풀고 싶으면 `/quiz` 이동

**추가 기능: QR 답안 + 답안지 인쇄**

```
┌─────────────────────────────────────────┐
│  오늘의 문제 (2026-03-19)   [답안 보기 ▼] │
│                             [📄 인쇄]    │
├─────────────────────────────────────────┤
│  문제들...                               │
│                                         │
│  ┌──────────────┐                        │
│  │  ▓▓ QR ▓▓   │ ← 이 QR로 답안 확인    │
│  │  ▓      ▓   │   (모바일에서 스캔)    │
│  │  ▓▓▓▓▓▓▓▓   │                        │
│  └──────────────┘                        │
└─────────────────────────────────────────┘
```

- **QR 코드**: `/today/answers?date=YYYY-MM-DD` URL을 QR로 생성
  - 패키지: `react-qr-code` (npm install react-qr-code)
  - 모바일에서 스캔 → 답안 전용 페이지로 이동
  - 날짜 기반이므로 오늘의 문제 세트와 1:1 대응
- **답안 전용 페이지**: `src/app/today/answers/page.tsx`
  - `?date=` 파라미터로 해당 날짜 문제 세트 로드
  - 표 형태 답안 (번호/유형/정답) + 인쇄 최적화 CSS
  - `@media print` — 헤더/네비 숨김, 답안 표만 출력
- **[📄 인쇄] 버튼**: 답안지만 인쇄
  - 클릭 시 `/today/answers?date=YYYY-MM-DD` 새 탭으로 열고 `window.print()` 트리거
  - 또는 홈 화면에서 직접 답안 영역만 `print-area` div로 인쇄 격리

**3. 일일 퀴즈 플로우 — `/daily` 라우트 (인터랙티브 모드)**

홈 화면은 정적 문제지(읽기 전용) + 인쇄/QR.
실제 풀기는 `/daily` 페이지에서 단계별 진행.

```
[홈] "오늘의 문제" 섹션
      └─ [지금 풀기 →] 버튼 → /daily

/daily 플로우:

STEP 1 — OX 퀴즈 (10문제, 전 영역에서 출제)
    ↓ 완료
    틀린 문제 없음 → STEP 2로
    틀린 문제 있음 → 버튼 2개 노출:
        [틀린 영역만 OX 다시 풀기]
        [단답형 문제로 넘어가기 →]   ← 둘 다 STEP 2로 이어짐

STEP 2 — 단답형 (5문제, STEP 1 틀린 영역 우선)
    ↓ 완료
    틀린 문제 없음 → STEP 3로
    틀린 문제 있음 → 버튼 2개 노출:
        [이 영역 단답형 한번 더]
        [서술형 문제로 넘어가기 →]   ← 둘 다 STEP 3로 이어짐

STEP 3 — 서술형 (3문제, STEP 2 틀린 영역 우선)
    ↓ 완료
    ✅ 오늘의 학습 완료! (최소 경로 OX10 + 단답5 + 서술3)

각 STEP 결과 화면:
    틀린 문제 목록 표시 + [개념 보러 가기 →] 링크
    → 해당 챕터 개념 학습 페이지 (카카오 개발자 docs 스타일)
```

구현 사항:
- `src/app/daily/page.tsx` — 플로우 라우트 (STEP 1→2→3 상태 관리)
- 문제 선택: 전 영역 랜덤 (OX), 이전 STEP 틀린 영역 우선 (단답/서술)
- 분기 버튼: 틀린 문제 수 > 0 일 때만 렌더링
- 고정 수량 (OX 10 / 단답 5 / 서술 3) — 나중에 사용자 설정으로 확장 가능하나 지금은 하드코딩
- 개념 링크: `/concepts/[chapter-slug]` (Q3 개념 학습 섹션 — 지금은 stub 링크)

**4. 기출문제 메뉴 숨김**

- `src/components/Header.tsx` (또는 네비게이션) — 기출문제 링크 제거 또는 `hidden` 처리
- 라우트(`/kice` 또는 기출 경로)는 삭제하지 말고 직접 URL 접근은 유지

### 완료 조건
- 홈 화면에 OX 10개 / 단답형 5개 / 문장형 3개 표시
- 기출문제 메뉴 미노출
- `npm run build` exit 0

**완료 후**: 아래 "세션 3 Opus 완료 메모"에 기록

---

## 세션 3 — Sonnet: 병렬 UI 패치 3개

**전제**: Opus 세션 3과 독립적 — 동시 진행 가능

### Agent 1 — ReviewPanel 수정

**목표**: 자동 저장 → 수동 "제출" 버튼, 제출 후 입력 초기화, 히스토리 뷰 제거

파일: `src/components/ReviewPanel.tsx`

1. `debounce` 자동저장 로직 완전 제거
2. "자동 저장 대기..." 상태 텍스트 제거
3. "제출" 버튼 추가 — 클릭 시 서버 저장 + localStorage 저장
4. 제출 성공 시 입력 필드 초기화 (텍스트 지움)
5. 히스토리 뷰(이전 작성 내역 목록) 제거
6. `npm run build` 확인 후 커밋:

```
fix(review): 자동저장 → 수동 제출, 히스토리 뷰 제거
```

### Agent 2 — ExamCountdown 하드코딩

**목표**: 시험일 사용자 설정 불필요 — 2026-11-21 고정

파일: `src/components/ExamCountdown.tsx`, `src/store/useStudyStore.ts`, `src/app/my/page.tsx`

1. `ExamCountdown.tsx` — `examDate` 상태 읽기 제거, `new Date('2026-11-21')` 하드코딩
2. `useStudyStore.ts` — `examDate` 필드 및 setter 제거 (사용처 확인 후 안전하게)
3. `src/app/my/page.tsx` — 시험일 수정 UI 제거, "특수교사 임용시험 D-day" 뷰어만 유지
4. `npm run build` 확인 후 커밋:

```
fix(planner): 시험일 2026-11-21 하드코딩 — 사용자 설정 제거
```

### Agent 3 — 온보딩 팝업 제거

**목표**: 첫 방문 시 시험일/학습계획 묻는 팝업/위저드 완전 제거

1. 온보딩 관련 컴포넌트/로직 검색 (`onboarding`, `wizard`, `firstVisit`, `examDate prompt` 등)
2. 발견된 온보딩 UI 제거 (컴포넌트 삭제 또는 렌더링 차단)
3. 첫 방문 감지 localStorage key도 제거
4. `npm run build` 확인 후 커밋:

```
chore(ux): 온보딩 팝업 제거 — 시험일/계획 설정은 /my 페이지로
```

---

## 세션 3 Opus 완료 메모

```
완료 날짜: 2026-03-19
선택한 알고리즘: Option A (날짜 시드 LCG 랜덤) — 홈은 정적 문제지 역할이므로 매일 동일 세트 보장이 중요
완료한 것:
  - HomeQuizSection.tsx (서버 컴포넌트, OX 10/단답 5/서술 3, 날짜 시드)
  - HomeQuizSectionClient.tsx (버튼 전용 카드, DAY-MMDD 코드, QR 제거)
  - /daily/page.tsx (STEP 1→2→3 플로우, 분기 버튼, 오답 챕터 우선)
  - /api/daily-questions/route.ts (GET, LCG 시드)
  - ExamCountdown.tsx (2026-11-21 하드코딩)
  - useStudyStore.ts (examDate/setExamDate 제거)
  - ReviewPanel.tsx (자동저장 → 수동 제출 버튼, 히스토리 뷰 제거)
  - Header.tsx + BottomTabBar.tsx (기출 → 오늘학습)
  - OnboardingGate page.tsx에서 제거
  - LoginClient.tsx 카카오 버튼 숨김
  - /today/answers/page.tsx (날짜별 답안 전용, 인쇄 최적화)
  - src/lib/sheet-code.ts (makeSheetCode 유틸)
  - 커밋 총 10개 / main 푸시 완료
빌드 상태: npm run build exit 0 ✅ / 테스트 54/54 ✅
주의사항:
  - react-qr-code 패키지 제거됨 (홈 QR 제거로 불필요)
  - 카이란 리뷰 5건 (status=pending) Supabase reviews 테이블에 보존 중
  - WrongNoteAI 분석 실패 (#198) — 원인: Vercel 환경변수에 GEMINI_API_KEY 미등록. 추가 완료 + 재배포로 수정됨 (2026-03-19)
```
