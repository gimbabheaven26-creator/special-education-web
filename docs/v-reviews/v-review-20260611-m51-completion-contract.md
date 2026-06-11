# V 검증: M5.1 Completion Contract (내부 품질 강화)

> 검증일: 2026-06-11 | 검증자: V | 대상: prompt_plan.md Completion Contract 22개 기준
> 대상 커밋: HEAD = c10a3d3 (Phase 3 구현 d6dacb7 포함)
> 검증 방법: grep 정적 검사 + 컴포넌트 코드 직접 판독 + vitest 타겟 실행 + 전체 스위트 실행

## 최종 판정

**22/22 PASS (100%) — 기준선 18/22(80%) 초과. M5.1 Completion Contract PASS.**

전체 테스트: `npm test` → **83 파일 / 1,092 테스트 / 0 실패** (989+ 기준 충족, 실행 증거 본문 하단).

---

## 기준별 판정

### 안정성 (8/8 PASS)

| # | 기준 | 판정 | 근거 |
|---|------|------|------|
| 1 | sync.ts, SyncManager.tsx에 `as any` 0개 | PASS | `grep -rn "as any" src/lib/db/sync.ts src/components/SyncManager.tsx` → 0건 (exit 1) |
| 2 | syncAllStores Zod 검증 — 손상 데이터 거부, 크래시 없음 | PASS | sync.ts:199-205 `storeSchemas[key].safeParse` — 실패 시 warn 후 skip (throw 없음). 스키마 거부 동작은 sync-schemas.test.ts 25케이스 통과 (rejects wrong types / box out of range / invalid focusMode 등) |
| 3 | Promise.allSettled — 1개 스토어 실패해도 나머지 5개 hydration | PASS | sync.ts:179 `Promise.allSettled`, 190-195 키별 rejected 격리 처리(warn 후 continue). pullFromServer 자체도 에러 시 null 반환 (117-120) |
| 4 | syncOnLogin 동시 호출 중복 방지 (뮤텍스) | PASS | SyncManager.tsx:59 `syncPromise` ref, 105-127 — 진행 중이면 기존 Promise 반환, finally에서 해제 + 동일 userId 재진입 차단(107) |
| 5 | PATCH /api/admin/quiz/[id] 유효하지 않은 입력 400 거부 | PASS | route.test.ts 4케이스 통과: bad type / empty update / unknown fields(strict) / difficulty out of range → 모두 400 assert |
| 6 | POST bulk 필드 누락 항목별 에러 반환 | PASS | bulk/route.ts:50-58 `issuesByIndex` (항목 인덱스별 Zod issue 그룹핑). 테스트 "includes item-level validation details" 통과 |
| 7 | API 라우트 테스트 파일 9개 이상 | PASS | `find src/app/api -name "*.test.ts*"` → **10개** ([id], bulk, generate, quality, feedback, profile, by-chapters, by-ids, wrong-report, opt-in) |
| 8 | 989+ 기존 테스트 전체 통과 | PASS | `npm test` → 83 files, **1,092 passed, 0 failed** (Duration 6.55s) |

### 품질 (7/7 PASS)

| # | 기준 | 판정 | 근거 |
|---|------|------|------|
| 9 | validateQuizQuality가 OX 잘못된 답 거부 | PASS | quiz-quality.test.ts "rejects OX with invalid answer" + "rejects OX with numeric answer" 통과 |
| 10 | validateQuizQuality가 설명 누락 시 경고 | PASS | "warns on missing explanation" + "warns on short explanation" 통과 |
| 11 | findDuplicates가 85%+ 유사 한국어 문제 감지 | PASS | duplicate-detector.test.ts "detects highly similar questions" + "handles exact duplicates" 통과 (Jaccard, threshold 0.85) |
| 12 | findDuplicates가 서로 다른 문제에 빈 배열 반환 | PASS | "does not flag different questions" + "returns empty for single/empty array" 통과 |
| 13 | GET /api/admin/quiz/quality 품질 메트릭 반환 | PASS | quality/route.test.ts "returns quality metrics" + "includes duplicate detection when requested" + "skips duplicates by default" 통과 |
| 14 | POST bulk 유효하지 않은 항목 warnings 배열 반환 | PASS | bulk/route.ts:65-85 — 품질 거부 항목(quality.errors)·경고 항목(quality.warnings) 모두 `warnings[]`에 push, :127에서 응답 반환. 품질 엔진 자체는 16케이스 테스트 통과. (단, 응답 레벨 warnings assert 테스트는 부재 — 발견사항 #1) |
| 15 | 기존 테스트 전체 통과 | PASS | #8과 동일 — 1,092/1,092 |

### 연계성 (7/7 PASS)

| # | 기준 | 판정 | 근거 |
|---|------|------|------|
| 16 | 개념 페이지 퀴즈 CTA 스크롤 없이 보임 | PASS | concepts/[subject]/[slug]/page.tsx:94 — ConceptActionPanel이 h1(:81) 직후, MDX 본문(:124) 이전 헤더 블록에 위치. ConceptActionPanel.tsx:48-58 "관련 퀴즈 풀기" primary 버튼. (정적 코드 위치 기준 판정 — 지시서상 코드 판독으로 검증) |
| 17 | QuizResultScreen 오답 > 0일 때 오답노트 링크 | PASS | QuizResultScreen.tsx:358-363 `wrongAnswerCount > 0` → `/wrong-notes` NextStep push. NextStepNudge.test.tsx 3케이스 통과 |
| 18 | CompletionScreen 점수 < 60%일 때 개념 링크 | PASS | CompletionScreen.tsx:89-91 `/concepts` 링크 — 무조건 표시이므로 <60%에서도 표시됨(기준 문구 충족). 계획서 3-2도 "기존 링크로 기충족" 명시. 추가로 QuizResultScreen.tsx:365-370은 rate<60 조건부 개념 링크 구현 (발견사항 #2 참조) |
| 19 | WeaknessInsight 약점 과목별 "개념 복습" 링크 | PASS | WeaknessInsight.tsx:108-111 — 과목 map 내부 `getConceptUrl(s.subject)` "개념 복습". WeakAreas.tsx:71-74도 동일 패턴. WeaknessInsight.test.tsx 통과 |
| 20 | 홈 대시보드 복습 카드 수 > 0일 때 DailyReviewCard 표시 | PASS | HomeDashboard.tsx:13 마운트(page.tsx:15에서 홈에 렌더). DailyReviewCard.tsx:20,56-73 — totalTodo(due+미처리 오답) > 0이면 "오늘 처리할 복습 N개" + 복습 CTA 표시 |
| 21 | 북마크 > 0일 때 추천 목록에 "북마크 복습" 항목 | PASS | useMyPageData.ts:87-88 `bookmarkCount > 0` → `/bookmarks/quiz` 추천 push. useMyPageData.test.ts "includes a bookmark review item when bookmarks exist" + "omits ... when no bookmarks" 통과 |
| 22 | 기존 테스트 전체 통과 | PASS | #8과 동일 — 1,092/1,092 |

---

## 실행 증거

```
npx vitest run (타겟 10파일: [id]/bulk/quality 라우트, quiz-quality, duplicate-detector,
                sync, sync-schemas, NextStepNudge, WeaknessInsight, useMyPageData)
 Test Files  10 passed (10)
      Tests  89 passed (89)

npm test (전체)
 Test Files  83 passed (83)
      Tests  1092 passed (1092)
   Duration  6.55s
```

---

## 발견 사항

| # | 항목 | 심각도 | 담당 | 상태 |
|---|------|--------|------|------|
| 1 | 통합 테스트 갭 3건 — 구현은 코드로 확인했으나 회귀 방지 테스트 부재 | MEDIUM | X | OPEN |
| 2 | CompletionScreen 개념 링크가 점수 무관 무조건 표시 (조건부 넛지 아님) | LOW | X | OPEN |
| 3 | visibilitychange flush의 fetch 내구성 — keepalive 미사용 | LOW | X | OPEN |

### 상세

**#1 통합 테스트 갭 (MEDIUM)**
- [문제] 다음 3개 동작이 코드에는 존재하지만 자동화 테스트가 없다:
  (a) `syncAllStores` 부분 실패 시 나머지 5개 스토어 hydration (sync.ts:179-206) — sync.test.ts는 syncAllStores를 전혀 import하지 않음
  (b) `syncOnLogin` 동시 호출 뮤텍스 (SyncManager.tsx:105-127) — SyncManager 테스트 파일 자체가 없음
  (c) bulk import 품질 거부 시 200 응답의 `warnings`/`rejected` 필드 (bulk/route.ts:123-128) — route.test.ts에 warnings assert 없음
- [증거] `grep -rn "syncAllStores\|syncOnLogin" src --include="*.test.*" -l` → 0건. bulk/route.test.ts에 "warnings" 문자열 0건
- [리스크] 다음 리팩토링에서 allSettled→all 회귀, 뮤텍스 제거, warnings 누락이 발생해도 테스트가 잡지 못한다. 이번 계약의 핵심 안정성 장치가 무방비
- [제안] SyncManager 훅 테스트(동시 syncOnLogin 2회 → pull 1회 assert), syncAllStores 1개 rejection 주입 테스트, bulk 품질거부 항목 포함 요청 → `rejected: 1, warnings: [...]` assert. 3개 합쳐 반나절 작업

**#2 CompletionScreen 무조건 링크 (LOW)**
- [문제] 기준 18의 의도는 "점수 기반 조건부 넛지"로 읽히나, 실제는 상시 노출 정적 링크. 기준 문구("<60%일 때 표시")는 충족하므로 PASS 판정했으나, 고득점 사용자에게도 "개념학습 보기"가 동일 강도로 노출되어 넛지 효과가 희석됨
- [제안] oxPct < 60일 때 wrongChapters 기반 해당 과목 개념 직링크로 승격 (QuizResultScreen.tsx:365 패턴 재사용)

**#3 flush 내구성 (LOW)**
- [문제] visibilitychange(hidden) flush(SyncManager.tsx:97-103)가 일반 fetch 기반 upsert를 호출 — 탭 완전 종료 시 브라우저가 in-flight 요청을 중단할 수 있음
- [리스크] 마지막 1.5초 내 변경분 유실 가능 (낮은 확률, 다음 세션 push로 자연 복구되는 경우 多)
- [제안] Supabase REST 직접 호출 + `keepalive: true` 검토. 우선순위 낮음

---

## 총평

M5.1은 8점(PASS). 22개 기준 전부 코드·테스트 증거로 확인됐고, 특히 sync 레이어의 `as any` 12→0, safeParse 기반 무크래시 hydration, API 라우트 테스트 3→10 확장은 실질적 부채 상환이다. 다만 "구현은 됐지만 테스트가 지키지 않는" 안정성 장치 3건(#1)은 다음 마일스톤 전에 메워야 한다 — 계약을 통과시킨 바로 그 장치들이 현재 회귀에 무방비라는 점이 9점을 막았다.
