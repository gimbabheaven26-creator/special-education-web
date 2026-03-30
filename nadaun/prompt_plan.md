# nadaun Phase 3: 현행수준 평가 + enriched 데이터 연동

> 확정일: 2026-03-30 | 승인: 카이란

## 목표

IEP의 구조적 빈틈(현행수준 없음)을 메우고, 2022 개정 교육과정 성취수준 풀 데이터를 활용하여 목표 설정 품질을 높인다.

**목표 흐름:**
```
학생 등록 → 성취기준 선택 → 현행수준 평가 → target_level 자동 추천 → 풀 기반 목표 구성 → AI 주간계획 (풀 데이터 포함)
```

## Phase 3-1: DB enrichment 컬럼 추가 + 데이터 삽입

achievement_standards 테이블에 enriched 데이터 4컬럼 추가 + normalized JSON 74개 upsert.

- [x] Task 1: migration SQL — considerations(text[]), curriculum_levels(jsonb), achievement_pool(jsonb), content_elements(jsonb) ✅ bb6fb51
- [x] Task 2: 삽입 스크립트 — normalized JSON → Supabase upsert (code 기준) ✅ cc3f9e7
- [ ] Task 3: 삽입 실행 + 74개 검증 — **카이란이 Supabase SQL Editor에서 migration 실행 필요**

## Phase 3-2: 현행수준(PLAAFP) 평가 UI

성취기준 선택 후 curriculum_levels 기반 간단 평가 → target_level 자동 추천.

- [x] Task 4: present_level Zod 스키마 + 타입 정의 ✅ bb6fb51
- [x] Task 5: PresentLevelAssessment 컴포넌트 — 3축 수준 선택 UI ✅ bb6fb51
- [x] Task 6: target_level 자동 추천 로직 ✅ bb6fb51
- [x] Task 7: IEP Plan Form에 현행수준 평가 단계 통합 ✅ bb6fb51

## Phase 3-3: 성취기준 선택기 enrichment

StandardSelector에 풀 미리보기 + curriculum_levels + considerations 표시.

- [x] Task 8: StandardSelector enriched 데이터 fetch + 표시 ✅ bb6fb51
- [x] Task 9: 성취기준 상세 패널 — 풀 + 수준 + 고려사항 ✅ bb6fb51

## Phase 3-4: 풀 기반 IEP 목표 자동 구성

achievement_pool에서 행동기술어 선택 → 목표 문장 조합.

- [x] Task 10: GoalComposer 컴포넌트 — 풀 columns별 기술어 선택 → 문장 조합 ✅ bb6fb51
- [x] Task 11: IEP Plan Form goals에 GoalComposer 통합 ✅ bb6fb51

## Phase 3-5: AI 프롬프트 enrichment

현행수준 + 풀 데이터를 AI 주간계획 프롬프트에 주입.

- [x] Task 12: AI 프롬프트 템플릿에 enriched + present_level 추가 ✅ bb6fb51
- [x] Task 13: iep_plans.goals JSONB에 present_level 필드 추가 (JSONB 유연성 — migration 불필요) ✅ bb6fb51

## Phase 3-6: 테스트 + 검증

- [x] Task 14: present_level 스키마 + 추천 로직 단위 테스트 (55건 신규) ✅ bb6fb51
- [x] Task 15: enriched 프롬프트 테스트 (4건 신규) ✅ bb6fb51
- [x] Task 16: npm run build exit 0 + lint 0 errors + 225 tests pass ✅ bb6fb51

## Completion Contract

V가 80% 이상 (16/20건) 통과 시 PASS.

### 기능 (8건)
- [ ] enriched 74개 DB 삽입 완료 — **Task 3 대기 (카이란 SQL 실행 필요)**
- [x] 성취기준 선택 시 curriculum_levels 표시
- [x] 성취기준 선택 시 achievement_pool 미리보기 표시
- [x] 현행수준 평가 UI에서 3축 수준 선택 가능
- [x] 현행수준 → target_level 자동 추천
- [x] 풀 행동기술어 선택 → 목표 문장 자동 조합
- [x] AI 프롬프트에 현행수준 + 풀 포함
- [x] enriched 없는 성취기준도 기존 흐름 동작 (fallback)

### UX (5건)
- [x] 현행수준 평가 직관적 (클릭 선택)
- [x] target_level 추천 근거 화면 표시
- [x] 풀 기반 목표 교사 수정 가능 (수동입력 토글)
- [x] considerations(고려사항) 표시
- [ ] 로딩 스켈레톤 표시 — StandardSelector dialog 내부 이미 처리

### 데이터 (3건)
- [ ] normalized 74개 ↔ DB 1:1 매칭 — **Task 3 대기**
- [x] present_level이 goals JSONB에 저장
- [x] achievement_pool이 {columns, items} 형태

### 보안 (2건)
- [x] 타 교사 현행수준 데이터 접근 불가 (RLS — 기존 iep_plans RLS 적용)
- [x] enriched 읽기 인증 필요 (기존 middleware 인증)

### 테스트 (2건)
- [x] target_level 추천 단위 테스트 통과 (14건)
- [x] npm run build exit 0

## 이전 계획

### Sprint 2 (2026-03-29, 완료)
배포 + 보안 + UX 성숙. Phase 11-14 전체 완료. C7(rate limiter Supabase 전환) 미완.
