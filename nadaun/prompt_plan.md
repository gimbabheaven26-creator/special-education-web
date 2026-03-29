# nadaun Sprint 2: 배포 + 보안 + UX 성숙

> 확정일: 2026-03-29 | 승인: 카이란

## 목표

MVP + Post-MVP 완료 후 실제 배포 + 보안 강화 + 교사 대시보드.

## Phase 11: 배포 준비

Vercel 서브디렉토리 배포 + 환경변수 + E2E 안전장치.

- [ ] T1: vercel.json 루트 디렉토리 설정 (nadaun/) + 빌드 커맨드 확인
- [ ] T2: 환경변수 체크리스트 문서 — NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY
- [x] T3: E2E_AUTH_BYPASS 이중 안전장치 — NODE_ENV === 'production'이면 무시

## Phase 12: 보안 강화

teacher_id 가드 누락 3건 수정 + 보안 테스트.

- [x] T4: deleteWeeklyPlan — getTeacherId() + IEP plan 소유권 검증
- [x] T5: updateWeeklyPlan — 동일 패턴 적용
- [x] T6: getStudents() — 명시적 .eq('teacher_id', teacherId) 추가
- [x] T7: 보안 테스트 3건 — 타 교사 데이터 접근 시도 → 실패 확인

## Phase 13: 프로덕션 안정성

rate limiter + 코드 정리.

- [x] T8: sanitizeFilename 공유 유틸 추출 — src/lib/utils/sanitize.ts
- [ ] T9: rate limiter Supabase 기반 전환 — rate_limits 테이블 + upsert
- [ ] T10: weekly-plan-section.tsx 분리 — WeeklyPlanItem + AddWeeklyPlanForm 추출

## Phase 14: 교사 대시보드

홈 화면 개편 + IEP 진행률.

- [ ] T11: / 홈 개편 — 학생 수, IEP 수, 이번 주 계획 요약 카드
- [ ] T12: IEP 진행률 표시 — 주간계획 작성 주차/총 주차 비율 배지

## 실행 순서

Phase 11 + Phase 12 **병렬** → Phase 13 → Phase 14

## 설계 결정

| 결정 | 이유 |
|------|------|
| Supabase rate limiter | 서버리스 다중 인스턴스에서 인메모리 카운터 무력화 |
| 애플리케이션 레벨 teacher_id 체크 | RLS는 최종 방어선, 앱 레벨이 1차 (심층 방어) |
| 홈 대시보드 | 비전의 "IEP↔수업 연결" 시각화 첫 단계 |
| E2E_AUTH_BYPASS 이중 가드 | production 실수 방지 |

## Completion Contract (15개)

### 보안 기준
- [x] C1: deleteWeeklyPlan이 타 교사 plan 삭제 시 에러 반환
- [x] C2: updateWeeklyPlan이 타 교사 plan 수정 시 에러 반환
- [x] C3: getStudents()가 teacher_id로 필터링
- [x] C4: E2E_AUTH_BYPASS가 NODE_ENV=production에서 무시됨
- [x] C5: 보안 테스트 3건 PASS

### 프로덕션 기준
- [x] C6: sanitizeFilename이 단일 소스 (src/lib/utils/sanitize.ts)
- [ ] C7: rate limiter가 Supabase 테이블 기반 동작
- [ ] C8: weekly-plan-section.tsx 300줄 이하
- [ ] C9: npm run build PASS

### 배포 기준
- [ ] C10: Vercel에 배포되어 접근 가능
- [ ] C11: Google OAuth가 배포 환경에서 동작
- [ ] C12: AI 생성이 배포 환경에서 동작

### UX 기준
- [ ] C13: 홈에서 학생 수 + IEP 수 확인 가능
- [ ] C14: IEP 상세에서 주간계획 진행률 확인 가능
- [ ] C15: 기존 E2E 79건 + 신규 테스트 전부 PASS

## 이전 계획

<details>
<summary>Post-MVP: Phase 7~10 (완료, 2026-03-29)</summary>

16/16 Task 완료. 20/20 Completion Contract PASS.
- Phase 7: error.tsx 5개 + loading + scripts
- Phase 8: IepPlanForm 통합 + orphan 삭제 + try/catch
- Phase 9: vitest 194건 + E2E 79건
- Phase 10: 주간계획 인라인 수정 + E2E 확장

</details>

<details>
<summary>Phase 2 — 성취기준 탐색 UI (완료)</summary>

Phase 2 전체 완료 (bc0d9d3, 2026-03-28).
16개 Completion Contract 전체 통과.

</details>
