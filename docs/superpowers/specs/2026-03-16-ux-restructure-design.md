# UX 재편 설계 — 네비게이션 구조 + 학습 흐름 + 구조도 + 오답노트 통합

> 작성일: 2026-03-16
> 상태: Review v2
> 대상: special-education-web

---

## 1. 배경 및 목적

현재 앱은 7개 탭(홈, 학습, 퀴즈, 문제지, 기출, 카드, 오답노트 + 통계)으로 구성되어 있으나, 학습 데이터가 충분하지 않은 상태에서 모든 기능이 노출되어 산만하다. 이번 재편의 목표:

1. **집중**: 당장 쓸 수 있는 기능만 노출, 나머지는 숨김
2. **흐름**: 메인 페이지가 학습 가이드 역할을 하도록 재설계
3. **통합**: 기능이 중복되는 탭(카드↔오답노트, 문제지↔기출)을 병합
4. **신규**: 구조도(계층형 노드 테이블) 추가

---

## 2. 네비게이션 구조 변경

### 2.1 Before → After

| 현재 (7탭+α) | 변경 후 (6탭) | 비고 |
|--------------|--------------|------|
| 홈 | **홈** | 학습 흐름 가이드로 재설계 |
| 학습 (subjects) | 숨김 | 라우트 유지, 네비에서만 제거 |
| 퀴즈 (quiz) | 숨김 | 라우트 유지, 네비에서만 제거 |
| 문제지 (worksheets) | → **기출 > 영역별** | 기출의 하위 탭으로 이동 |
| 기출 (kice) | **기출** | 연도별 + 영역별 2탭 구조 |
| 출제 경향 (kice 하위) | **출제 경향** | 상위 탭으로 승격 |
| 카드 (flashcards) | → 오답노트에 흡수 | 탭 제거 |
| 오답노트 (wrong-notes) | **오답노트** | SRS 복습 통합 |
| 통계 (stats) | **통계** | 유지 |
| — | **구조도** (신규) | 계층형 노드 테이블 |

### 2.2 최종 탭 순서

```
홈 · 기출 · 출제 경향 · 구조도 · 오답노트 · 통계
```

### 2.3 모바일 6탭 레이아웃

모바일 BottomTabBar에 6탭 배치. 현재 "더보기" 메뉴는 제거.

```
[홈] [기출] [출제경향] [구조도] [오답노트] [통계]
```

- 아이콘+라벨 크기를 축소하여 6탭 수용 (아이콘 20px, 라벨 10px)
- 데스크톱: 상단 헤더에 6탭 모두 표시
- 기존 "더보기" 메뉴 항목 (시뮬레이터, 마스터리, 북마크, 검색 등): 숨김 처리 (라우트 유지)

### 2.4 숨김 처리 원칙

**"숨김" = 네비에서 제거, 라우트 유지:**

| 라우트 | 상태 | 접근 방법 |
|--------|------|----------|
| `/subjects/*` | 라우트 유지 | 구조도 하이퍼링크, 홈 ③ 보충학습 링크 |
| `/quiz/*` | 라우트 유지 | 홈 ① "오늘의 문제 풀기" 링크 |
| `/flashcards` | 301 리다이렉트 → `/wrong-notes` | 완전 대체 |
| `/worksheets` | 301 리다이렉트 → `/kice?tab=by-area` | 완전 대체 |

- 데이터와 Zustand 스토어는 그대로 동작
- 학습 콘텐츠는 오답노트/구조도에서 맥락적 하이퍼링크로 연결
- 기존 북마크/딥링크로 숨긴 라우트에 직접 접근 가능

---

## 3. 홈 (메인 페이지) 재설계

### 3.1 현재 문제

- "오늘의 학습"과 "이어서 학습하기"가 내용 중복
- 전체과목 섹션이 불필요하게 노출
- 요청하지 않은 항목이 한꺼번에 다 보임

### 3.2 새 구조

```
┌─────────────────────────────┐
│ 🔥 N일 연속 학습중            │
│ 오늘의 목표: 기출 10문제       │
└─────────────────────────────┘

[학습 흐름 가이드]

① 오늘의 문제 풀기
   └─ 기출/퀴즈 통합 세션 (이어서 학습하기 포함)

② 오답노트 확인
   └─ 틀린 문제 요약 + 바로가기

③ 부족한 부분 보충
   └─ 취약 영역 학습 콘텐츠 링크 (subjects 맥락 연결)

④ 틀린 문제 다시 풀기
   └─ SRS 복습 대상 문제
```

### 3.3 변경 사항

| 항목 | 처리 |
|------|------|
| 스트릭 배너 (파란 상자) | 유지 + 오늘의 목표 추가 |
| "오늘의 학습" + "이어서 학습하기" | 단일 섹션으로 병합 → ① "오늘의 문제 풀기" |
| 전체과목 섹션 | 제거 |
| QuestionOfTheDay | 학습 흐름 ①에 통합 가능 (선택) |

**병합 상세**: DailyGoalCard(오늘의 목표)와 ContinueLearning(세션 복구)을 하나의 `<TodaySession />` 컴포넌트로 합침. 목표 진행률 + 이어하기 버튼을 같은 카드에 표시.

### 3.4 재활용 후보

- edumind **위젯 티어 시스템**: 학습량 기반 단계적 노출 (0→10→50 문제)
- edumind **DdayBanner**: 시험 D-day 카운트다운
- edumind **ResumeSessionCard**: 세션 이어하기 패턴

---

## 4. 기출 (2탭 구조)

### 4.1 연도별 기출

현재 `/kice` UI를 그대로 유지. 변경사항 없음.

- 연도 선택 → 회차 선택 → 문제 풀이
- ExamClient.tsx 재사용

### 4.2 영역별 기출 (구 문제지)

현재 `/worksheets`를 기출의 하위 탭으로 이동.

- **과목 선택** → 영역/유형 자동 제공
- 기출 문제를 영역별로 재구성
- 현재 worksheet 데이터는 **동형검사지**로 활용 (기출 영역 분류 기반)
- URL: `/kice?tab=by-area`

### 4.3 탭 UI 및 구현

```
┌──────────────┬──────────────┐
│  연도별 기출  │  영역별 기출  │
└──────────────┴──────────────┘
```

**KiceClient 리팩토링:**
- `useSearchParams().get('tab')` → `'by-year'` (기본) | `'by-area'`
- KiceByYear.tsx: 현재 KiceClient 로직 추출 (연도/회차 선택)
- KiceByArea.tsx: 현재 WorksheetSolver UI 재활용 (과목/영역/유형 선택기)
- 탭 전환 시 URL 업데이트 (`/kice?tab=by-area&subject=...`)
- 모바일: 탭 UI는 상단 고정, 컨텐츠 영역만 스크롤

---

## 5. 출제 경향 (상위 탭 승격)

### 5.1 현재 상태

`/kice` 내부의 출제 경향 분석 기능 (kice-analytics.ts + AnalyticsClient.tsx):
- 히트맵 (영역별 출제 빈도)
- 키워드 연속출제 분석
- 연도별 트렌드

### 5.2 변경

- 독립 라우트: `/analytics`
- `/app/analytics/page.tsx` 생성, AnalyticsClient.tsx를 import
- 기존 `/kice/analytics/page.tsx` → `redirect('/analytics')` (301)
- 기출 페이지에서는 링크로 연결

---

## 6. 구조도 (신규)

### 6.1 개요

과목 → 영역 → 챕터 → 핵심 개념을 계층적으로 탐색하는 노드 테이블.

### 6.2 데이터 소스

- 기존 subjects 테이블 (11과목)
- 기존 chapters 테이블 (39챕터)
- 학습 콘텐츠에서 추출한 핵심 개념 (향후 확장)

### 6.3 UI 설계

```
[브레드크럼] 전체 > 특수교육학개론 > 통합교육

┌─────────────────────────────────────────┐
│ 통합교육                                 │
├─────────────────────────────────────────┤
│ ▸ 통합교육의 정의와 배경    [기출 3건]    │
│ ▸ 최소제한환경 (LRE)       [기출 5건]    │
│ ▸ 통합교육 지원 체계        [기출 2건]    │
│ ▸ 협력교수 유형             [기출 7건]    │
│ ▸ 교육과정 수정             [기출 4건]    │
└─────────────────────────────────────────┘
```

- 각 노드 클릭 → 하위 레벨 드릴다운
- **[기출 N건]** 클릭 → 해당 영역 기출문제로 점프
- 상위 노드는 항상 브레드크럼에 표시
- 현재 레벨의 형제 노드도 함께 표시 (맥락 유지)

### 6.4 특징

- 텍스트 노드 기반 (이미지/버튼 없음)
- 하이퍼링크: 기출, 영역별 문제, 학습 콘텐츠(subjects)로 연결
- 모바일 친화적: 테이블 레이아웃, 터치 대응
- 브레드크럼으로 올라가기, 노드 클릭으로 내려가기

### 6.5 재활용 후보

- edumind **RoadmapClient.tsx**: TanStack Table v8 기반, 정렬/필터 지원 → 구조도 메인 테이블
- gosari-namu-path **SectionNav.tsx**: 좌측 목차 + 브레드크럼 패턴 → 네비게이션 참고

> 참고: gosari-namu-path의 ConceptMap.tsx는 MDX 전용 컴포넌트로, 구조도에 직접 재활용 불가. edumind RoadmapClient 기반으로 새로 구현.

### 6.6 라우트

- `/structure`

---

## 7. 오답노트 (카드 흡수 + SRS 통합)

### 7.1 현재 상태

- **오답노트** (`/wrong-notes`): 틀린 문제 목록, 챕터 필터, URL params
- **카드** (`/flashcards`): Leitner SRS 간격 반복, 3D 플립

### 7.2 통합 설계

```
오답노트 (/wrong-notes)
├─ [기본 뷰] 틀린 문제 목록 (필터/검색/정렬)
├─ [SRS 복습] 간격 반복 학습 모드
│   └─ 틀린 문제 → 자동 SRS 대상 등록
│   └─ 복습 주기: FSRS 또는 Leitner (1→2→4→8→16일)
└─ [재풀이] 틀린 문제 다시 풀기
```

### 7.3 핵심 변경

1. **자동 SRS 등록**: 문제를 틀리면 자동으로 SRS 대상에 추가
2. **카드 탭 제거**: `/flashcards` 라우트 숨김, 오답노트 내 SRS 복습 모드로 대체
3. **복습 알림**: 홈 학습 흐름 ④에서 "복습할 문제 N개" 표시
4. **마스터리 졸업**: Leitner 박스 5 도달 + 30일 유지 시 졸업 (FSRS 전환 시: stability > 365일 AND lapses == 0)

### 7.4 SRS 엔진 선택

| 옵션 | 장점 | 단점 |
|------|------|------|
| 현재 Leitner (5박스) | 이미 구현됨, 단순 | 개인화 없음 |
| edumind FSRS (ts-fsrs) | 학습자 맞춤 간격, 학술 검증 | 마이그레이션 필요 |

**추천**: 1차는 현재 Leitner 유지, 2차에서 FSRS로 업그레이드.

### 7.5 재활용 후보

- edumind **useSrsStore.ts**: FSRS 전체 생명주기 (2차 적용 시)
- edumind **WrongNotesClient.tsx**: 에러 패턴 분류 + 벌크 액션
- edumind **FlashcardClient.tsx**: SRS 복습 루프

---

## 8. 통계

현재 유지. 데이터가 충분히 쌓이면 활성화.

기존 컴포넌트: DailyHeatmap, WeeklyTrendChart, FlashcardStats, StatsClient 등 그대로 보존.

---

## 9. 기술적 고려사항

### 9.1 라우팅 변경

| 현재 라우트 | 변경 후 | 리다이렉트 | 비고 |
|------------|--------|----------|------|
| `/` | `/` | — | 홈 재설계 |
| `/subjects/*` | `/subjects/*` | — | 라우트 유지, 네비 숨김. 구조도/홈 링크로 접근 |
| `/quiz/*` | `/quiz/*` | — | 라우트 유지, 네비 숨김. 홈 ① 링크로 접근 |
| `/worksheets` | `/kice?tab=by-area` | 301 | `redirect()` in page.tsx |
| `/kice` | `/kice?tab=by-year` | — | 2탭 구조, 기본=연도별 |
| `/kice/analytics` | `/analytics` | 301 | `redirect()` in page.tsx |
| `/flashcards` | `/wrong-notes` | 301 | `redirect()` in page.tsx |
| `/flashcards/*` | `/wrong-notes` | 301 | 하위 경로 포함 |
| `/wrong-notes` | `/wrong-notes` | — | SRS 통합 확장 |
| `/structure` | `/structure` | — | 신규 |
| `/mastery` | `/mastery` | — | 네비 숨김, 라우트 유지 |
| `/simulator/*` | `/simulator/*` | — | 네비 숨김, 라우트 유지 |

### 9.2 데이터 보존

- Zustand 스토어 (useStudyStore, useLeitnerStore, useQuizStore, useBookmarkStore): 변경 없음
- Supabase 테이블: 변경 없음
- localStorage: 기존 데이터 그대로 유지

### 9.3 숨김 처리 방식

네비게이션 컴포넌트(BottomTabBar 또는 해당 네비)에서 링크만 제거. 라우트 파일은 삭제하지 않음.

### 9.4 리다이렉트 구현

모든 301 리다이렉트는 Next.js `redirect()` 사용:

```typescript
// src/app/flashcards/page.tsx
import { redirect } from 'next/navigation'
export default function FlashcardsPage() {
  redirect('/wrong-notes')
}
```

동일 패턴을 `/worksheets/page.tsx`, `/kice/analytics/page.tsx`에 적용.

---

## 10. 구현 우선순위

### Phase A: 네비게이션 재편 (최우선)

1. 네비게이션 6탭 구조로 변경
2. 학습/퀴즈/카드 탭 숨김
3. 홈 페이지 학습 흐름 가이드 재설계
4. 스트릭 박스 + 오늘의 목표 통합

### Phase B: 기출 2탭 + 출제 경향 승격

5. 기출 페이지에 연도별/영역별 탭 추가
6. 문제지 → 영역별 기출로 이동
7. 출제 경향 독립 라우트 분리

### Phase C: 오답노트 SRS 통합

8. 틀린 문제 → 자동 SRS 등록 로직
9. 오답노트 내 SRS 복습 모드 UI
10. 카드 탭 숨김 + 리다이렉트

### Phase D: 구조도 신규

11. 구조도 페이지 scaffold
12. 과목→영역→챕터 노드 테이블
13. 하이퍼링크 연결 (기출, 학습 콘텐츠)
14. 브레드크럼 네비게이션

---

## 11. 재활용 컴포넌트 요약

### edumind에서

| 컴포넌트 | 원본 경로 | 적용처 |
|---------|----------|--------|
| RoadmapClient.tsx | `edumind/src/app/roadmap/` | 구조도 |
| BottomTabBar.tsx | `edumind/src/components/layout/` | 네비게이션 |
| useSrsStore.ts | `edumind/src/stores/` | 오답노트 SRS (2차) |
| WrongNotesClient.tsx | `edumind/src/app/wrong-notes/` | 오답노트 |
| 위젯 티어 시스템 | `edumind/src/components/dashboard/` | 홈 |
| DdayBanner | `edumind/src/components/dashboard/` | 홈 |

### gosari-namu-path에서

| 컴포넌트 | 원본 경로 | 적용처 |
|---------|----------|--------|
| SectionNav.tsx | `gosari-namu-path/src/components/courses/` | 구조도 네비 참고 |
| SectionFooter.tsx | `gosari-namu-path/src/components/courses/` | 기출 페이지네이션 |
| 브레드크럼 패턴 | `gosari-namu-path/src/app/(dashboard)/courses/[courseSlug]/page.tsx` | 구조도 브레드크럼 |

---

## 12. 구현 체크리스트

### Phase A: 네비게이션 재편

- [ ] BottomTabBar 6탭 구조로 수정 (홈/기출/출제경향/구조도/오답노트/통계)
- [ ] 학습/퀴즈/카드/시뮬레이터/마스터리 탭 네비에서 숨김
- [ ] "더보기" 메뉴 제거
- [ ] `/flashcards` → `/wrong-notes` 301 리다이렉트
- [ ] `/worksheets` → `/kice?tab=by-area` 301 리다이렉트
- [ ] `/kice/analytics` → `/analytics` 301 리다이렉트

### Phase B: 홈 재설계

- [ ] 전체과목(SubjectGrid) 섹션 제거
- [ ] "오늘의 학습" + "이어서 학습하기" → TodaySession 컴포넌트로 병합
- [ ] 학습 흐름 가이드 4단계 UI
- [ ] 스트릭 박스에 오늘의 목표 추가

### Phase C: 기출 2탭

- [ ] KiceClient에 tab searchParam 추가
- [ ] KiceByYear.tsx 추출 (현재 로직)
- [ ] KiceByArea.tsx 추출 (WorksheetSolver UI 재활용)
- [ ] 탭 전환 UI + 모바일 대응

### Phase D: 출제 경향 독립

- [ ] `/app/analytics/page.tsx` 생성
- [ ] AnalyticsClient.tsx import 연결

### Phase E: 구조도

- [ ] `/app/structure/page.tsx` scaffold
- [ ] 과목→영역→챕터 계층 노드 테이블 (TanStack Table v8 참고)
- [ ] 브레드크럼 네비게이션
- [ ] 기출/학습 콘텐츠 하이퍼링크

### Phase F: 오답노트 SRS 통합

- [ ] 틀린 문제 → 자동 SRS 등록 로직
- [ ] 오답노트 내 SRS 복습 모드 UI
- [ ] 마스터리 졸업 로직 (Leitner 박스 5 + 30일)

---

## 13. 성공 기준

- [ ] 메인 페이지에서 3클릭 이내에 문제 풀이 시작 가능
- [ ] 숨긴 탭(학습/퀴즈/카드)의 기존 데이터/기능이 정상 동작
- [ ] 301 리다이렉트 정상 작동 (flashcards, worksheets, kice/analytics)
- [ ] 기출 연도별/영역별 전환이 자연스러움
- [ ] 오답노트에서 SRS 복습 진입이 직관적
- [ ] 구조도에서 기출/학습 콘텐츠로의 하이퍼링크가 정상 작동
- [ ] 모바일 6탭 BottomTabBar 정상 표시
- [ ] 모바일/데스크톱 반응형 유지
