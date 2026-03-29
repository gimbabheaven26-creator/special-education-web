# nadaun Post-MVP: 프로덕션 준비 + 품질 개선

> 확정일: 2026-03-29 | 승인: 카이란

## 목표

MVP 완료(Phase 0~6 + QA) 후 프로덕션 배포 전 안정성/품질/테스트 강화.

## Phase 7: 프로덕션 안정성

에러 바운더리 + 누락 로딩 + 스크립트 정비.

- [x] T1: error.tsx 5개 — students, plans/new, plans/[planId], plans/[planId]/edit, 루트
- [x] T2: loading.tsx 누락분 — 이미 존재 확인 (추가 불필요)
- [x] T3: package.json scripts — test:e2e 추가 (나머지 이미 존재)

## Phase 8: 코드 정리

중복/orphan/import 불일치 해소.

- [x] T4: IepPlanForm 통합 — 이전 세션에서 완료 (new/page.tsx → plans/ import)
- [x] T5: orphan 삭제 — 이전 커밋(fcc871d)에서 components/iep/ 삭제 완료
- [x] T6: supabase import 통일 — 이미 전부 browser 사용 확인 (변경 불필요)
- [x] T7: generate-button 리팩토링 — bulkInsertWeeklyPlans server action + Button 컴포넌트
- [x] T8: handleDelete try/catch — plan-status-actions, delete-student-dialog 2건 추가

## Phase 9: 테스트 확장

서버 액션 + 컴포넌트 + API + E2E.

- [x] T9: server actions 테스트 — iep-plans(14건), weekly-plans(15건), students(10건) = 39건
- [x] T10: 컴포넌트 로직 테스트 — PlanStatusActions(5건), WeeklyPlanSection 중복검증(5건) = 10건
- [x] T11: API route 테스트 — generate(6건), sanitizeFilename(5건), UUID검증(4건) = 15건
- [ ] T12: E2E 워크플로우 — 학생 CRUD + IEP 생성/수정/삭제

## Phase 10: 주간계획 인라인 수정

현재 추가/삭제만 가능 → 인라인 편집 추가.

- [x] T13: updateWeeklyPlan server action — 이미 존재 확인
- [x] T14: WeeklyPlanItem 편집 모드 토글 — editingId 상태 + 인라인 폼
- [x] T15: 주차 번호 중복 방지 검증 — handleEdit에서 duplicate 체크
- [ ] T16: 인라인 수정 E2E 테스트 — 인증 필요, E2E 확장 시 추가

## 실행 순서

Phase 7 + Phase 8 **병렬** → Phase 9 → Phase 10

## 설계 결정

| 결정 | 이유 |
|------|------|
| error.tsx Server Component | 클라이언트 번들 최소화, reset 버튼만 client |
| IepPlanForm plans/ 기준 통합 | edit 페이지가 이미 plans/ 사용, new 페이지만 import 변경 |
| generate-button server action | 직접 Supabase insert는 RLS 우회 리스크 + 서버 검증 불가 |
| handleDelete try/catch | 네트워크 에러 시 UI stuck 방지 |

## Completion Contract (20개 — 16/20 = PASS)

### 안정성 (Phase 7)
- [x] C1: 5개 라우트에 error.tsx 존재
- [x] C2: error.tsx에 reset 버튼 + 사용자 친화 메시지
- [x] C3: loading.tsx — 이미 존재 확인
- [x] C4: npm run dev/build/test/lint/test:e2e 모두 package.json에 정의

### 코드 품질 (Phase 8)
- [x] C5: components/iep/ 디렉토리 삭제됨
- [x] C6: IepPlanForm 단일 소스 (plans/)
- [x] C7: supabase import가 모두 @/lib/supabase/browser
- [x] C8: generate-button이 server action 사용
- [x] C9: 모든 handleDelete에 try/catch 존재
- [x] C10: 빌드 PASS (0 errors)

### 테스트 (Phase 9)
- [x] C11: server actions 테스트 3개 파일 (39건)
- [x] C12: 컴포넌트 로직 테스트 1파일 (10건)
- [x] C13: API route 테스트 1파일 (15건)
- [x] C14: 전체 vitest PASS (194건)

### 인라인 수정 (Phase 10)
- [x] C15: 주간계획 수정 가능 (편집 버튼 + 인라인 폼)
- [x] C16: 수정 후 DB 반영 확인 (updateWeeklyPlan 서버액션)
- [x] C17: 주차 번호 중복 시 에러 표시
- [x] C18: 수정 취소 시 원래 값 복원 (defaultValue 패턴)

### 전체
- [x] C19: 빌드 + 타입체크 + 린트 전체 PASS
- [ ] C20: E2E 기존 11건 + 신규 전체 PASS

## 이전 계획

<details>
<summary>Phase 2 — 성취기준 탐색 UI (완료)</summary>

Phase 2 전체 완료 (bc0d9d3, 2026-03-28).
16개 Completion Contract 전체 통과.

</details>
