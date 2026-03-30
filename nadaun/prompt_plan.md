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

- [ ] Task 1: migration SQL — considerations(text[]), curriculum_levels(jsonb), achievement_pool(jsonb), content_elements(jsonb)
- [ ] Task 2: 삽입 스크립트 — normalized JSON → Supabase upsert (code 기준)
- [ ] Task 3: 삽입 실행 + 74개 검증

## Phase 3-2: 현행수준(PLAAFP) 평가 UI

성취기준 선택 후 curriculum_levels 기반 간단 평가 → target_level 자동 추천.

- [ ] Task 4: present_level Zod 스키마 + 타입 정의
- [ ] Task 5: PresentLevelAssessment 컴포넌트 — 3축 수준 선택 UI (depends: Task 3)
- [ ] Task 6: target_level 자동 추천 로직 (depends: Task 4)
- [ ] Task 7: IEP Plan Form에 현행수준 평가 단계 통합 (depends: Task 5, Task 6)

## Phase 3-3: 성취기준 선택기 enrichment

StandardSelector에 풀 미리보기 + curriculum_levels + considerations 표시.

- [ ] Task 8: StandardSelector enriched 데이터 fetch + 표시 (depends: Task 3)
- [ ] Task 9: 성취기준 상세 패널 — 풀 + 수준 + 고려사항 (depends: Task 8)

## Phase 3-4: 풀 기반 IEP 목표 자동 구성

achievement_pool에서 행동기술어 선택 → 목표 문장 조합.

- [ ] Task 10: GoalComposer 컴포넌트 — 풀 columns별 기술어 선택 → 문장 조합 (depends: Task 3)
- [ ] Task 11: IEP Plan Form goals에 GoalComposer 통합 (depends: Task 7, Task 10)

## Phase 3-5: AI 프롬프트 enrichment

현행수준 + 풀 데이터를 AI 주간계획 프롬프트에 주입.

- [ ] Task 12: AI 프롬프트 템플릿에 enriched + present_level 추가 (depends: Task 7)
- [ ] Task 13: iep_plans.goals JSONB에 present_level 필드 추가 migration (depends: Task 4)

## Phase 3-6: 테스트 + 검증

- [ ] Task 14: present_level 스키마 + 추천 로직 단위 테스트 (depends: Task 6)
- [ ] Task 15: enriched 데이터 삽입 검증 테스트 (depends: Task 3)
- [ ] Task 16: npm run build + lint 통과 (depends: all)

## Completion Contract

V가 80% 이상 (16/20건) 통과 시 PASS.

### 기능 (8건)
- [ ] enriched 74개 DB 삽입 완료
- [ ] 성취기준 선택 시 curriculum_levels 표시
- [ ] 성취기준 선택 시 achievement_pool 미리보기 표시
- [ ] 현행수준 평가 UI에서 3축 수준 선택 가능
- [ ] 현행수준 → target_level 자동 추천
- [ ] 풀 행동기술어 선택 → 목표 문장 자동 조합
- [ ] AI 프롬프트에 현행수준 + 풀 포함
- [ ] enriched 없는 성취기준도 기존 흐름 동작 (fallback)

### UX (5건)
- [ ] 현행수준 평가 직관적 (up/down 또는 클릭)
- [ ] target_level 추천 근거 화면 표시
- [ ] 풀 기반 목표 교사 수정 가능
- [ ] considerations(고려사항) 표시
- [ ] 로딩 스켈레톤 표시

### 데이터 (3건)
- [ ] normalized 74개 ↔ DB 1:1 매칭
- [ ] present_level이 goals JSONB에 저장
- [ ] achievement_pool이 {columns, items} 형태

### 보안 (2건)
- [ ] 타 교사 현행수준 데이터 접근 불가 (RLS)
- [ ] enriched 읽기 인증 필요

### 테스트 (2건)
- [ ] target_level 추천 단위 테스트 통과
- [ ] npm run build exit 0

## 이전 계획

### Sprint 2 (2026-03-29, 완료)
배포 + 보안 + UX 성숙. Phase 11-14 전체 완료. C7(rate limiter Supabase 전환) 미완.
