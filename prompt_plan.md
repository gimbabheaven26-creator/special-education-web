# M5: 서비스 구조 재구성 — SEW Cockpit

> 작성: 2026-05-28 | 담당: X | 상태: 계획 승인, Phase 1 대기
> 배경: M4 이후 48개 라우트가 퇴적층처럼 쌓임. SEW Next(Codex 프로토타입)의 UX 비전은 우수하나 데이터/테스트 부재. Next의 설계 원칙을 기존 코드에 이식한다.

## 설계 원칙

| 원칙 | 의미 |
|------|------|
| **조종실 중심** | 홈 = 준비도 + 오늘의 작전 + 빠른 진입. 진단/일일/대시보드를 하나로 |
| **모드 통합** | 모든 문제풀기는 /learn/session?mode=X 하나로 |
| **탭 통합** | 분석 페이지들은 /record?tab=X 하나로 |
| **데이터 보존** | 3116 퀴즈, 6개 스토어, Supabase 동기화 그대로 |
| **점진 배포** | 각 Phase 독립 배포 가능. 리다이렉트로 이전 URL 보장 |

## 새 정보 구조 (3+1)

```
조종실 (/)
├─ 준비도 hero (readiness %)
├─ 오늘의 작전판 (daily prescription)
├─ 고위험 영역 (weak domains)
└─ 4모드 빠른 진입

학습 (/learn)
├─ /learn/session?mode=adaptive     (적응형 — 진단+AI추천)
├─ /learn/session?mode=qbank        (문제은행 — 영역/난도/형식)
├─ /learn/session?mode=mock         (모의고사 — 압축/실전형)
├─ /learn/session?mode=review       (복습 — Leitner+오답)
├─ /learn/concepts                  (개념+용어+플래시카드 탭)
│   ├─ /learn/concepts/[subject]
│   └─ /learn/concepts/[subject]/[slug]
└─ (인터랙티브, 시나리오, 워크시트는 학습 허브 내 탭)

기록 (/record)
├─ ?tab=overview    (종합 대시보드 + 숙련도 통합)
├─ ?tab=wrong-notes (오답노트)
├─ ?tab=bookmarks   (북마크)
├─ ?tab=kice        (기출분석)
└─ ?tab=mastery     (숙련도 트리)

함께하기 (/community) — 변경 없음
```

**라우트 수: 48 → ~21 (56% 감소)**

## Phase 1: Foundation (0.5일)

**목표**: 네비게이션 + 라우트 맵 인프라. 보이는 변화 = 네비 라벨만.

- [ ] 1-1. `nav-config.ts` → 3+1 구조 (조종실/학습/기록/함께하기)
- [ ] 1-2. `route-map.ts` 신규 → OLD→NEW URL 매핑 상수
- [ ] 1-3. `next.config.mjs` → `redirects()` 함수 추가
- [ ] 1-4. Header, BottomTabBar 정상 렌더링 확인

## Phase 2: Cockpit — 조종실 (2일)

**목표**: / 페이지를 준비도 조종실로 변환. /today, /daily, /next 흡수.

- [ ] 2-1. ReadinessHero — 준비도 게이지 (실제 퀴즈 데이터)
- [ ] 2-2. OperationsBoard — 오늘의 작전판
- [ ] 2-3. HighRiskDomains — 고위험 영역 카드
- [ ] 2-4. QuickEntry — 4모드 빠른 진입 그리드
- [ ] 2-5. /today, /daily, /next 리다이렉트

## Phase 3: Learn — 통합 학습 (3-4일) ⚠️ 최대 규모

**목표**: /learn 허브 + /learn/session 통합 세션. 모든 문제풀기를 하나로.

- [ ] 3-1. /learn 학습 허브 (8개 모드 그리드)
- [ ] 3-2. /learn/session SessionRouter (mode별 클라이언트 분기)
- [ ] 3-3. adaptive, mock, review, diagnostic 모드 연결
- [ ] 3-4. qbank, worksheet, scenario, daily 모드 연결
- [ ] 3-5. 기존 quiz/practice/exam URL 리다이렉트

## Phase 4: Learn/Concepts — 통합 개념 (1.5일)

**목표**: /concepts + /terms + /flashcards → /learn/concepts 탭 통합.

- [ ] 4-1. /learn/concepts 3탭 (개념/용어/플래시카드)
- [ ] 4-2. /learn/concepts/[subject]/[slug] MDX 렌더링
- [ ] 4-3. BookmarkStore 경로 마이그레이션
- [ ] 4-4. 기존 URL 리다이렉트

## Phase 5: Record — 통합 기록 (2일)

**목표**: /record + /mastery + /wrong-notes + /bookmarks + /kice → 탭 통합.

- [ ] 5-1. RecordTabs 5탭 (종합/숙련도/오답/북마크/기출)
- [ ] 5-2. mastery 흡수 (OverviewTab)
- [ ] 5-3. wrong-notes, bookmarks, kice 탭 래퍼
- [ ] 5-4. 기존 URL 리다이렉트

## Phase 6: Cleanup (1.5일)

**목표**: 데드 코드 제거, 내부 링크 전수 조사, PWA 업데이트.

- [ ] 6-1. 폐기 라우트 디렉토리 삭제 (12개+)
- [ ] 6-2. prototype-data.ts 705줄 삭제
- [ ] 6-3. 리다이렉트 스텁 → next.config.mjs 통합
- [ ] 6-4. 내부 href 전수 조사 (폐기 경로 0개)
- [ ] 6-5. PWA manifest + 빌드 + 테스트 최종 검증

## Completion Contract

V(평가자)가 80% 이상 통과해야 PASS. 총 20개 기준.

### 구조 기준 (5/5)
- [ ] 활성 라우트 25개 이하
- [ ] 네비게이션 3+1 그룹
- [ ] 모든 문제풀기가 /learn/session 하나로 통합
- [ ] 모든 분석이 /record 하나로 통합
- [ ] 모든 개념학습이 /learn/concepts 하나로 통합

### 기능 기준 (7/7)
- [ ] 조종실에 준비도 % 표시 (실제 데이터)
- [ ] 조종실에 오늘의 작전판 표시
- [ ] /learn/session?mode=mock&variant=full로 23문항 모의고사
- [ ] /learn/session?mode=adaptive로 적응형 퀴즈
- [ ] /learn/concepts 3탭 (개념/용어/플래시카드)
- [ ] /record 5탭 (종합/숙련도/오답/북마크/기출)
- [ ] 기존 기능 100% 접근 가능 (폐기 기능 없음)

### 호환성 기준 (4/4)
- [ ] 40+ 기존 URL 전부 301 리다이렉트
- [ ] 리다이렉트 루프 없음
- [ ] PWA 정상 동작
- [ ] Vercel 배포 정상

### 품질 기준 (4/4)
- [ ] `npm run build` exit 0
- [ ] `npm run lint` 경고 0건
- [ ] 1013+ 테스트 통과
- [ ] 내부 href에 폐기 경로 0개

**총 20개 기준, 16개(80%) 이상 통과해야 PASS.**

---

## 이전 계획

### M4: 콘텐츠의 숨결 (2026-05-06)
> 담당: X | 상태: Phase 0-1 완료, Phase 2 미실행 (M5로 우선순위 변경) | 9/13 task (69%)

### M3: 학습 경험 재설계 (2026-04-22)
> 담당: X | 상태: M3 전체 완료 (2026-04-29) | 18/18 task, CC 20/20 PASS 100%

### M2: 만족도 끌어올리기 (2026-04-06)
> 담당: X | 상태: M2 전체 완료 (2026-04-20) | 43/43 task, V 검증 PASS 100%

### 플래시카드 전면 재설계 (2026-03-31)
> 담당: X | 상태: Phase 0~5 전체 완료 (2026-04-01)

### M3: 만족도 갭 해소 (2026-03-30)
> 담당: X | 상태: B1~B7 전체 완료

### 나다운 MVP (2026-03-27~29)
> 담당: X | 상태: Phase 0~5 + AI 전체 완료 (MVP 100%)
