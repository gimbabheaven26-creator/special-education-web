# nadaun Phase 4: 계획 상세 보강 + 대시보드 개선 + 진도 시각화

> 확정일: 2026-03-30 | 승인: 대기

## 목표

Phase 3에서 만든 현행수준 평가 + enriched 데이터가 교사에게 보이도록 계획 상세 페이지를 보강하고, 대시보드에 실질적 진도 시각화를 추가한다.

**핵심 질문:** "교사가 계획을 세우고 AI가 주간계획을 생성한 뒤, 진행 상황을 한 눈에 파악할 수 있는가?"

**목표 흐름:**
```
[Phase 3] IEP 계획 작성 (enriched)
    ↓
[Phase 4-1] 계획 상세에 현행수준/고려사항 표시
[Phase 4-2] 주간계획에 진도 체크 + 메모
[Phase 4-3] 대시보드에 학생별 진도 요약
[Phase 4-4] 계획 인쇄/공유 개선 (present_level 반영)
```

## Phase 4-1: 계획 상세 페이지 enrichment (3건)

IEP 상세 페이지에서 Phase 3 데이터가 교사에게 보이도록.

- [ ] Task 1: 목표 카드에 present_level 표시 — 3축 평가 결과 + 추천 근거 + notes
- [ ] Task 2: 목표 카드에 considerations(고려사항) 표시 — 수업 시 참고할 사항
- [ ] Task 3: 목표 카드에 target_level Badge 색상 분화 — 기초(outline)/보통(secondary)/우수(default)

## Phase 4-2: 주간계획 진도 추적 (5건)

교사가 주차별로 "진행됨/완료" 표시 + 간단 메모.

- [ ] Task 4: weekly_plans 테이블에 status 컬럼 추가 — 'planned'|'in_progress'|'completed' (default: 'planned')
- [ ] Task 5: weekly_plans에 progress_notes text 컬럼 추가 — 교사 메모
- [ ] Task 6: WeeklyPlanItem에 상태 토글 버튼 + 메모 인라인 편집 UI
- [ ] Task 7: 주간계획 상태 변경 server action (depends: Task 4)
- [ ] Task 8: 주간계획 목록에 상태별 색상 표시 — planned(회색)/in_progress(파랑)/completed(녹색)

## Phase 4-3: 대시보드 진도 시각화 (4건)

메인 페이지에서 학생별 진도를 한 눈에 파악.

- [ ] Task 9: 대시보드 학생 카드에 진도 프로그레스 바 추가 (depends: Task 4)
- [ ] Task 10: 대시보드에 "이번 주 할 일" 섹션 — 현재 주차의 미완료 계획 목록
- [ ] Task 11: 학생 상세 페이지 진도 요약 개선 — 상태별 주차 수 + 프로그레스 바
- [ ] Task 12: 진도 쿼리 함수 — getWeeklyPlanProgress(studentId) (depends: Task 4)

## Phase 4-4: 내보내기 보강 (2건)

현행수준 평가 결과가 내보내기에 반영.

- [ ] Task 13: 텍스트/Excel 내보내기에 present_level 섹션 추가 (depends: Task 1)
- [ ] Task 14: PDF 내보내기에 present_level 표시 + considerations 표시

## Phase 4-5: 테스트 + 검증 (2건)

- [ ] Task 15: 주간계획 상태 변경 단위 테스트 (depends: Task 7)
- [ ] Task 16: npm run build + lint 통과 (depends: all)

## Completion Contract

V가 80% 이상 (13/16건) 통과 시 PASS.

### 기능 (6건)
- [ ] 계획 상세에서 present_level 3축 평가 결과 확인 가능
- [ ] 계획 상세에서 considerations 확인 가능
- [ ] 주간계획 상태 토글 (planned → in_progress → completed)
- [ ] 주간계획 진도 메모 입력/수정
- [ ] 대시보드에서 학생별 진도 프로그레스 바 확인
- [ ] 내보내기(텍스트/Excel/PDF)에 present_level 포함

### UX (5건)
- [ ] 상태 토글이 1클릭으로 동작
- [ ] 상태별 색상 직관적 (회색/파랑/녹색)
- [ ] 프로그레스 바 퍼센트 표시
- [ ] "이번 주 할 일" 목록이 메인 대시보드에 표시
- [ ] 현행수준 평가 결과가 읽기 쉬운 형태로 표시

### 데이터 (3건)
- [ ] weekly_plans.status 컬럼 DB 반영
- [ ] weekly_plans.progress_notes 컬럼 DB 반영
- [ ] 기존 주간계획 데이터가 'planned' 기본값으로 유지

### 테스트 (2건)
- [ ] 상태 변경 단위 테스트 통과
- [ ] npm run build exit 0

## 이전 계획

### Phase 3 (2026-03-30, 완료)
현행수준 평가 + 성취수준 풀 + enriched IEP 빌더. 16/16 tasks 완료. CC 20/20.
커밋: bb6fb51, cc3f9e7, 81584c7.

### Sprint 2 (2026-03-29, 완료)
배포 + 보안 + UX 성숙. Phase 11-14 전체 완료. C7(rate limiter Supabase 전환) 미완.
