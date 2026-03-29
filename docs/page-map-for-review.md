# 페이지 맵 — 카이란 리뷰용 (2026-03-29)

사이트: https://special-education-web.vercel.app

하단 탭 4개 영역 + 홈 기준으로 정리.
카이란이 리뷰하면서 발견한 문제를 이 문서 하단 "피드백" 섹션에 추가하면 X가 순차 수정한다.

---

## 홈 (`/`)

| 구성요소 | 설명 |
|---------|------|
| OnboardingGate | 첫 방문 시 온보딩 유도 |
| ExamCountdown | D-day 카운트다운 |
| DailyReviewCard | 오늘 복습 (SRS + 오답) |
| "오늘 학습 시작하기" 버튼 | → `/daily` |
| StreakBanner | 연속 학습일 |
| TodayTermCard | 오늘의 단어 |
| AiBriefingCard | AI 브리핑 |
| AdminQuickAccess | 관리자 전용 |

---

## 1. 진단평가 (만족도: 50%)

하단 탭 "진단평가" → 서브: OX퀴즈, 단답형, 용어학습

| 라우트 | 페이지 | loading | error | 현재 상태 |
|--------|--------|---------|-------|----------|
| `/diagnosis` | 진단평가 허브 (OX/단답 카드 + 최근 진단 이력) | - | - | 작동 |
| `/quiz/ox` | OX 전과목 진단 | O | O | 작동 |
| `/quiz/short` | 단답형 전과목 진단 | **X** | **X** | loading/error 없음 |
| `/quiz/[subject]` | 과목별 퀴즈 (객관식/OX/빈칸/서술/시나리오) | O | O | 작동, TODO 4개(정교화 질문 비활성) |
| `/terms` | 용어사전 (과목별 필터 + 검색) | O | - | 작동, 10자 미만 정의 필터링 |
| `/kice` | 기출문제 분석 (연도별/영역별/분석/검색 4탭) | O | O | 작동 |
| `/kice/exam` | 모의고사 풀기 | - | - | 작동 |
| `/kice/analytics` | 출제경향 분석 | - | - | 작동 |

**알려진 이슈:**
- `/quiz/short` loading.tsx, error.tsx 없음
- QuizClient.tsx: 정교화 질문 TODO 4건 (비활성 상태)

---

## 2. 실력쌓기 (만족도: <20%)

하단 탭 "실력쌓기" → 서브: 개념학습, 문제풀기, 인터랙티브

| 라우트 | 페이지 | loading | error | 현재 상태 |
|--------|--------|---------|-------|----------|
| `/practice-hub` | 실력쌓기 허브 (개념/문제/인터랙티브 3카드) | - | - | 메타데이터 없음 |
| `/concepts` | 과목별 개념학습 (MDX 101개) | O | **X** | error.tsx 없음 |
| `/concepts/[subject]` | 과목 개념 파일 목록 | - | - | 작동 |
| `/concepts/[subject]/[slug]` | 개별 개념 문서 | - | - | 작동 |
| `/practice` | 문제풀기 허브 (모의고사/워크시트 2카드) | - | - | 작동 |
| `/worksheets` | 토픽별 워크시트 | - | - | DB 의존 |
| `/worksheets/[id]` | 워크시트 풀기 | O | O | QR코드 URL 하드코딩 |
| `/interactive` | 인터랙티브 (장애매칭/법조문/IEP 5단계) | O | O | **데이터 전부 하드코딩** (3개 활동만) |
| `/daily` | 오늘학습 (OX→빈칸→서술 3단계) | O | O | 작동 |
| `/flashcards` | 플래시카드 (라이트너 SRS) | O | **X** | /review로 즉시 리다이렉트 |
| `/flashcards/review` | 복습 모드 | - | - | 작동 |
| `/flashcards/add` | 카드 추가 | - | - | DB 의존 |
| `/mastery` | 마스터리 트리 (과목별 습득도 시각화) | O | O | 작동 |
| `/scenarios` | 상황 시뮬레이션 (분기형 의사결정) | O | O | 하드코딩 데이터 |
| `/scenarios/[id]` | 개별 시나리오 | - | - | 작동 |

**알려진 이슈:**
- `/interactive`: 콘텐츠 3개뿐 (장애매칭 5쌍, 법조문 1개, IEP 5단계) — 전부 하드코딩
- `/concepts`: error.tsx 없음
- `/flashcards`: error.tsx 없음, 빈 스토어 시 에러 상태 미처리
- `/practice-hub`: metadata 없음
- `/scenarios`: 데이터 하드코딩 (`@/data/scenarios`)

---

## 3. 내 기록 (만족도: <20%)

하단 탭 "내 기록" → 서브: 마스터리트리, 학습통계, 북마크, 출제경향, 오답노트, 플래시카드

| 라우트 | 페이지 | loading | error | 현재 상태 |
|--------|--------|---------|-------|----------|
| `/my` | 마이페이지 (프로필/진도/최근오답/기능카드 8개) | - | - | 작동 |
| `/stats` | 학습통계 (정확도/레벨/주간/과목별/약점AI) | O | O | 작동 |
| `/wrong-notes` | 오답노트 (필터/정렬/SRS모드) | O | O | 작동 |
| `/wrong-notes/quiz` | 오답 재퀴즈 | - | - | 확인 필요 |
| `/bookmarks` | 북마크 챕터 목록 | O | - | **링크 버그**: 북마크 퀴즈가 `/wrong-notes/quiz`로 연결 |
| `/reviews` | 리뷰 (관리자 전용) | O | - | 작동 |

**알려진 이슈:**
- `/bookmarks`: "북마크 퀴즈" 버튼이 `/wrong-notes/quiz`를 가리킴 — 의도인지 버그인지 확인 필요
- `/my`: 닉네임 프롬프트 취소 시 UX 어색할 수 있음
- 게스트 모드: 로컬 데이터만 사용, 동기화 없음

---

## 4. 함께하기 (만족도: <20%)

하단 탭 "함께하기" → 서브: 커뮤니티, 리뷰, 상황시뮬레이션

| 라우트 | 페이지 | loading | error | 현재 상태 |
|--------|--------|---------|-------|----------|
| `/community` | 커뮤니티 문제 목록 (정렬/필터/투표) | O | O | 작동 |
| `/community/create` | 문제 만들기 | - | - | 작동 |
| `/community/mine` | 내가 만든 문제 | - | - | 로그인 필수 |
| `/community/[id]` | 문제 상세/풀기 | - | - | 작동 |
| `/search` | 통합 검색 (퀴즈+챕터+과목) | - | - | Fuse.js 퍼지검색 |

**알려진 이슈:**
- 콘텐츠 양이 적을 수 있음 (커뮤니티 문제 수)
- `/scenarios`가 "함께하기" 탭에 있지만 성격상 "실력쌓기"에 가까움

---

## 기타 라우트

| 라우트 | 설명 | 상태 |
|--------|------|------|
| `/onboarding` | 초기 설정 5단계 위저드 | 작동 |
| `/today` | **페이지 없음** — `/today/answers`만 존재 | 미구현 |
| `/subjects` | `/concepts`로 리다이렉트 | 작동 |
| `/login` | 로그인 | 작동 |
| `/admin` | 관리자 페이지 | 작동 |

---

## 코드에서 발견된 이슈 요약

| # | 영역 | 이슈 | 심각도 |
|---|------|------|--------|
| 1 | 내기록 | `/bookmarks` 퀴즈 버튼 → `/wrong-notes/quiz` 링크 (의도 확인 필요) | HIGH |
| 2 | 기타 | `/today` 메인 페이지 미존재 | HIGH |
| 3 | 진단평가 | `/quiz/short` loading.tsx, error.tsx 없음 | MEDIUM |
| 4 | 실력쌓기 | `/interactive` 콘텐츠 3개뿐, 전부 하드코딩 | MEDIUM |
| 5 | 실력쌓기 | `/concepts` error.tsx 없음 | LOW |
| 6 | 실력쌓기 | `/flashcards` error.tsx 없음 | LOW |
| 7 | 실력쌓기 | `/practice-hub` metadata 없음 | LOW |
| 8 | 실력쌓기 | `/scenarios` 데이터 하드코딩 | LOW |
| 9 | 진단평가 | QuizClient 정교화 질문 TODO 4건 | LOW |

---

## 피드백 (카이란이 직접 작성)

카이란이 사이트를 보면서 발견한 문제를 여기에 추가.
형식: `- [영역] 페이지명: 문제 설명`

(아래에 추가)

