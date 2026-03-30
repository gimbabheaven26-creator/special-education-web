# nadaun Phase 5: 진단평가 기초 + 학기말 보고 + 교사 일상 도구

> 확정일: 2026-03-30 | 완료: 16/16 tasks, CC pending V검증

## 목표

Phase 1~4에서 교육과정(1층) → IEP(2층) → 주간계획(3층) 3개 층을 완성했다. Phase 5는 4층 진단평가의 MVP 기초를 놓고, 교사가 학기말까지 실제로 매일 사용할 수 있는 실용 기능을 추가한다.

**핵심 질문:** "교사가 한 학기 동안 나다운만으로 IEP 작성부터 학기말 보고까지 처리할 수 있는가?"

**Phase 5가 해결하는 현장 문제:**
1. 주간계획 완료 후 "이 학생이 실제로 얼마나 달성했는가?"를 기록할 곳이 없다
2. 학기말에 IEP 진행 보고서를 행정적으로 제출해야 하는데, 나다운 데이터를 수동으로 옮겨야 한다
3. 주간계획 생성 후 수정/재생성이 불편하다
4. 학생이 여러 명이고 과목도 여러 개인데 한 눈에 파악하기 어렵다

**목표 흐름:**
```
[Phase 4] 주간계획 진도 추적 (상태 토글 + 메모)
    ↓
[Phase 5-1] 주간 달성도 간이 평가 (체크리스트 + 관찰 기록)
[Phase 5-2] 학기말 IEP 진행 보고서 자동 생성
[Phase 5-3] 대시보드 고도화 + 주간계획 재생성
[Phase 5-4] 테스트 + 검증
```

## Phase 5-1: 주간 달성도 간이 평가 (5건)

교사가 completed로 상태를 바꿀 때, 해당 주차의 학습 결과를 간단히 기록할 수 있도록 한다. 주차마다 3단계(미달/달성/초과) + 관찰 메모. 이것이 4층(진단평가)의 MVP이다.

- [x] Task 1: weekly_plans 테이블에 달성도 컬럼 추가 — `achievement_rating` enum('not_met'|'met'|'exceeded') nullable + `observation_notes` text nullable
- [x] Task 2: 달성도 입력 UI — 주간계획 항목 완료 시 3버튼(미달/달성/초과) + 관찰 기록 텍스트 입력 (depends: Task 1)
- [x] Task 3: 달성도 저장 server action — updateWeeklyPlanAchievement(weeklyPlanId, rating, observationNotes) (depends: Task 1)
- [x] Task 4: 주간계획 목록에 달성도 아이콘 표시 — 미달(빨강), 달성(녹색), 초과(파랑), 미입력(회색) (depends: Task 2)
- [x] Task 5: 목표별 달성도 집계 쿼리 — getGoalAchievementSummary(iepPlanId) → 목표별 {total, notMet, met, exceeded} (depends: Task 1)

## Phase 5-2: 학기말 IEP 진행 보고서 (4건)

한 학기 동안 축적된 진도 + 달성도 + 메모를 학기말 보고서 형태로 자동 생성한다. 교사가 IEP 진행 보고서를 행정 시스템에 제출할 때 복사/붙여넣기할 수 있는 형태.

- [x] Task 6: 진행 보고서 데이터 집계 함수 — generateProgressReport(iepPlanId) → 학생정보 + 목표별 달성률 + 주차별 관찰 기록 요약 + 종합 의견 (depends: Task 5)
- [x] Task 7: 진행 보고서 UI 페이지 — /students/[studentId]/plans/[planId]/report (depends: Task 6)
- [x] Task 8: 진행 보고서 텍스트/PDF 내보내기 — 기존 export 인프라 확장 (depends: Task 6)
- [x] Task 9: AI 종합 의견 생성 — 달성도 데이터 + 관찰 기록을 기반으로 한 학기 학습 성과 요약문 자동 생성 (교사 수정 가능) (depends: Task 6)

## Phase 5-3: 대시보드 고도화 + 주간계획 UX 개선 (5건)

교사가 매일 열었을 때 "오늘 뭘 해야 하는지" 바로 알 수 있도록 대시보드를 강화하고, 주간계획 재생성/일괄편집 편의성을 높인다.

- [x] Task 10: 대시보드 학생 카드에 달성도 미니 요약 추가 — 최근 4주 달성률 스파크라인 or 숫자 (depends: Task 5)
- [x] Task 11: 캘린더 뷰 — 현재 주차 기준으로 학생별 예정/진행/완료 주간계획을 주간 캘린더 형태로 시각화
- [x] Task 12: 주간계획 일괄 상태 변경 — 여러 주차를 선택하여 한번에 상태 변경 (체크박스 + 일괄 처리 버튼)
- [x] Task 13: 주간계획 부분 재생성 — 특정 주차 범위만 선택하여 AI 재생성 (기존 주차 보존)
- [x] Task 14: IEP 계획 복제 — 기존 계획을 기반으로 새 학기 계획 복제 (날짜만 변경)

## Phase 5-4: 테스트 + 검증 (2건)

- [x] Task 15: 달성도 + 보고서 단위 테스트 — 집계 함수, 보고서 포매터, achievement_rating 유효성 (depends: Task 5, 6)
- [x] Task 16: npm run build + lint 통과 (depends: all)

## Completion Contract

V가 80% 이상 (16/20건) 통과 시 PASS.

### 기능 (8건)
- [ ] 주간계획 완료 시 달성도(미달/달성/초과) 입력 가능
- [ ] 관찰 기록(텍스트) 입력 가능
- [ ] 달성도 아이콘이 주간계획 목록에 표시됨
- [ ] 목표별 달성률 집계 확인 가능
- [ ] 학기말 진행 보고서 페이지에서 전체 요약 확인 가능
- [ ] 보고서 텍스트/PDF 내보내기 동작
- [ ] AI 종합 의견 생성 + 교사 수정 가능
- [ ] IEP 계획 복제 동작

### UX (5건)
- [ ] 달성도 3버튼이 1클릭으로 동작 (상태 토글과 동일한 패턴)
- [ ] 대시보드에서 학생별 최근 달성 추이 한 눈에 확인
- [ ] 캘린더 뷰에서 현재 주차 하이라이트
- [ ] 주간계획 일괄 선택 + 상태 변경이 직관적
- [ ] 보고서 페이지가 인쇄 친화적 (print CSS)

### 데이터 (4건)
- [ ] weekly_plans.achievement_rating 컬럼 DB 반영
- [ ] weekly_plans.observation_notes 컬럼 DB 반영
- [ ] 기존 데이터에 achievement_rating null 유지 (비파괴적 마이그레이션)
- [ ] 보고서 집계 쿼리가 정확한 결과 반환

### 테스트 (3건)
- [ ] 달성도 집계 함수 단위 테스트 통과
- [ ] 보고서 포매터 단위 테스트 통과
- [ ] npm run build exit 0

## 이전 계획

### Phase 4 (2026-03-30, 완료)
계획 상세 보강 + 대시보드 진도 시각화 + 내보내기 enrichment. 16/16 tasks 완료. CC 16/16.

### Phase 3 (2026-03-30, 완료)
현행수준 평가 + 성취수준 풀 + enriched IEP 빌더. 16/16 tasks 완료. CC 20/20.
커밋: bb6fb51, cc3f9e7, 81584c7.

### Sprint 2 (2026-03-29, 완료)
배포 + 보안 + UX 성숙. Phase 11-14 전체 완료. C7(rate limiter Supabase 전환) 미완.
