# 강선생 다음 지시서
작성: 스미스 프라임 | 날짜: 2026-03-19 | 대상: 강선생 Opus + Sonnet
> Reviews 관리자 시스템 + Auth 골격 완료 후 시작.

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
`src/components/ExamCountdown.tsx` — 다음 Sonnet 세션에서 생성 예정.
시험일 미설정 시 배너 숨김 (설정 유도 없음).

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
3. `npm run build` 확인 후 커밋

```
feat(ai): Gemini 1.5-flash 연결 — 커뮤니티 AI 어시스턴트
```

**Agent 2 — ExamCountdown D-day 플래너**

참고: `docs/superpowers/plans/2026-03-18-ai-planner.md` Chunk 2

1. `src/store/useStudyStore.ts` — `examDate` 필드 추가 (persist 포함)
2. `src/components/ExamCountdown.tsx` — D-day 카운트다운 컴포넌트 생성
3. `src/app/my/page.tsx` — ExamCountdown 추가
4. `npm run build` 확인 후 커밋

```
feat(planner): D-day 카운트다운 — /my 시험일 설정
```

**Agent 3 — WrongNoteAI 약점 분석**

참고: `docs/superpowers/plans/2026-03-18-ai-planner.md` Chunk 3

1. `src/app/api/ai/weakness/route.ts` — Gemini 약점 분석 API 신규
2. `src/components/WrongNoteAI.tsx` — 분석하기 버튼 + 결과 컴포넌트
3. 오답노트 페이지에 WrongNoteAI 통합
4. `npm run build` 확인 후 커밋

```
feat(ai): 오답노트 AI 약점 분석 — Gemini 기반 취약 챕터 + 학습 전략
```

**Agent 완료 후**: `npm run build` 전체 확인 → PASS → 완료 커밋

---

## Opus 완료 메모 (Opus가 작업 후 여기에 기록)

```
완료 날짜:
완료한 것:
빌드 상태:
Sonnet에게 인계:
주의사항:
```
