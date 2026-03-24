# 클루디 지시서: M1 안전망 + M2 데이터 (Week 1~2)

/auto --mode feature 안전망 구축 + 데이터 정합성

## Week 1 작업

### 1. 스토어 마이그레이션 테스트
- src/stores/ 내 5개 Zustand 스토어 확인
- v3→v4→v5 마이그레이션 로직에 대한 테스트 작성
- 특히 useQuizStore, useLeitnerStore — 오답노트/플래시카드 데이터 소실 방지
- vitest 사용 (package.json의 test 스크립트)

### 2. Sentry 에러 모니터링 도입
- @sentry/nextjs 설치
- sentry.client.config.ts, sentry.server.config.ts 설정
- next.config.mjs에 withSentryConfig 래핑
- 환경변수: SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT
- 기존 console.error를 Sentry.captureException으로 교체할 필요 없음 — Sentry가 자동 캡처

## Week 2 작업

### 3. src/lib 도메인별 분리
- 현재: src/lib/ 에 45개 파일 혼재
- 목표 구조:
  ```
  src/lib/
    quiz/       (db.ts에서 quiz 관련 함수 추출)
    kice/       (kice.ts, kice-analytics.ts)
    user/       (profile.ts, auth-utils.ts, admin-auth.ts)
    community/  (community-db.ts)
    study/      (study-planner.ts, mastery.ts, badges.ts 등)
    review/     (review-db.ts)
    utils/      (utils.ts, date-utils.ts, array-utils.ts 등)
    supabase/   (이미 존재)
  ```
- db.ts (356줄) → 도메인별로 분할, db.ts는 re-export 허브로 유지 (호환성)
- import 경로 전체 업데이트 (290개 파일 확인)

### 4. quiz_questions 입력 validation
- src/lib/quiz/validation.ts 신규 생성
- 검증 규칙:
  - question 필드 비어있으면 reject
  - answer 필드 비어있으면 reject
  - type이 허용된 값(ox, short, descriptive, fill_in, scenario_composite)인지
  - subject/chapter 존재 여부
  - fill_in 답변이 3줄 이상이면 경고
  - 복수 빈칸 패턴(①②③, ㉠㉡㉢) 포함 시 경고
- /api/admin/quiz POST/PATCH에 validation 적용

### 5. contract.md 정합성
- docs/contract.md와 실제 Supabase 스키마 비교
- 불일치 항목 리스트 작성 및 해소
- DB 마이그레이션 supabase CLI 자동화

## 검증
- npx tsc --noEmit → 0 에러
- npm run test → 전체 통과
- npm run build → exit 0
