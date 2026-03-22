# Beta Prep Sprint — 완료 보고

- **작업자**: V (브이) `v-0322.night`
- **날짜**: 2026-03-22
- **목표**: 2주 내 베타 런칭 준비 (10~20명 테스터)

---

## Phase 1 — KST date-utils 중복 제거

- **커밋**: `19adcab`
- 7곳에 흩어져 있던 `getKSTDate()` 로컬 정의를 `src/lib/date-utils.ts` 하나로 통합
- `getToday()`, `addDays()`, `isYesterday()` 포함
- 테스트 14개 작성 (KST 경계값 포함)
- **변경 파일**: useLeitnerStore, useOnboardingStore, useStudyStore, spaced-scenario, study-planner, HomeQuizSection, today/answers/page

## Phase 2 — Sync 충돌 방지

- **커밋**: `d46e4f7`, `9f91efe`
- `pushToServer` 반환값을 `'pushed' | 'skipped' | 'error'`로 명시
- `SyncManager`에서 `lastSyncTs` ref로 timestamp-guarded push 구현
- 서버 데이터가 더 최신이면 pull → hydrate 처리
- **변경 파일**: sync.ts, SyncManager.tsx

## Phase 3 — CI 파이프라인

- **커밋**: `807c860`
- `.github/workflows/ci.yml` 생성 (checkout → Node 22 → npm ci → lint → test → build)
- Vitest가 Playwright e2e 테스트를 잘못 실행하던 문제 수정 (`exclude: ['tests/e2e/**']`)
- **변경 파일**: ci.yml (신규), vitest.config.ts

## Phase 4 — SEO 메타데이터 + WrongNote hydration 수정

- **커밋**: `55b1161`
- `layout.tsx`에 `metadataBase` + `title: { template: "%s | 특수교육 공부방" }` 추가
- 6개 기존 페이지에 metadata export 추가
- 3개 클라이언트 라우트용 `layout.tsx` 신규 생성 (daily, mastery, scenarios)
- `WrongNotesClient`에서 서버 전용 `db.ts`를 클라이언트에서 임포트하던 빌드 에러 수정
  - `useHydratedWrongNotes` 훅 제거 → `allQuestions` prop 패턴으로 교체
- **변경 파일**: layout.tsx, 6개 page.tsx, 3개 layout.tsx 신규, WrongNotesClient, WrongNoteCard, wrong-notes/page

## Phase 5 — 에러 바운더리

- **커밋**: `f00ad4b`
- 7개 라우트에 `error.tsx` 추가: kice, stats, community, daily, mastery, wrong-notes, scenarios
- 라우트별 맞춤 에러 메시지 + 다시시도/돌아가기 버튼
- 기존 패턴(root error.tsx, quiz/[subject]/error.tsx) 준수

## Phase 6 — Legacy 정리 + Analytics

- **커밋**: `f00ad4b` (Phase 5와 동일 커밋)
- `src/lib/supabase.ts` 삭제 — 임포터 0개, `supabase/browser.ts` + `server.ts`로 완전 대체
- `src/lib/analytics.ts` 생성 — 3개 이벤트 타입:
  - `quiz_completed` (subject, chapter, score, total)
  - `wrong_note_mastered` (questionId, attempts)
  - `daily_streak` (streak, date)
- 편의 헬퍼 3개: `logQuizCompleted`, `logWrongNoteMastered`, `logDailyStreak`
- 테스트 7개 (비로그인 스킵, insert 호출, 에러 무시 등)

---

## 최종 검증

- **빌드**: 성공 (Next.js 14.2.35)
- **테스트**: 17 파일, 187개 전부 통과
- **린트**: 에러 0

---

## 잔여 과제 (V가 못 한 것)

1. `analytics_events` Supabase 테이블 생성 필요
2. `useHydratedWrongNotes.ts` 데드코드 삭제
3. E2E 테스트(Playwright) 실제 실행 확인
4. 베타 피드백 수집 UI
5. Vercel Analytics / Web Vitals 연동
