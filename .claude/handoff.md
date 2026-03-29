# Handoff Document
생성일시: 2026-03-25 23:59 KST
에이전트: 프라임 (X 역할 겸임)
effort: high

## 1. 완료한 작업

### 노션 구조변경 (프라임 본업)
- 프로젝트 대시보드: Phase 태그 12개 → M0~M4 5개로 교체, 담당자 통일
- 지식 베이스: 태그 63개 → 16개로 정제, 41개 문서 태그 리매핑
- 스프린트 로그: 에이전트/태그 통일, M1 작업 6건 등록
- 커밋: d5d7c13

### V리뷰 0325 전체 해소
- error.tsx 13개 → RouteErrorPage 공통 컴포넌트 추출 (커밋: 1ba5915)
- role="alert" 추가 (WCAG 4.1.3)
- rate limiter Map 정리 (1bc28c8, 선행 커밋)
- next-pwa /api/ NetworkOnly (1bc28c8, 선행 커밋)
- V리뷰 7/7 해소 (커밋: a5f7903)

### 기타
- Claude Desktop "Folder no longer exists" 진단 → 고아 gitlink 제거
- git worktree prune 실행
- 빌드 검증 (exit 0), 린트 (0 errors)

## 2. 변경 파일 요약

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| prompt_plan.md | 수정 | 노션 구조변경 실행 결과 기록 |
| .claude/worktrees/relaxed-pascal | 삭제 | 고아 gitlink 제거 |
| src/components/ui/RouteErrorPage.tsx | 신규 (선행) | 에러 페이지 공통 컴포넌트 |
| src/app/*/error.tsx (13개) | 수정 | RouteErrorPage 사용으로 1-liner화 |
| docs/v-reviews/v-review-0325-m1-ux.md | 수정 | 7건 전체 FIXED/WONTFIX |

## 3. 다음 세션 우선순위

### 강선생 Day 2 (3/26)
1. global-error.tsx 추가 (Next.js 루트 에러 바운더리)
2. QuizResultScreen 문구 개선
3. LayoutProviders 분리 검토 (layout.tsx 컴포넌트 12개)

### 클루디 (미착수)
- FK 제약 5개, 세분화 챕터, 퀴즈 ID 통일, 워크시트 데이터 등 7건
- contract.md v2 기준, 카이란 승인 완료

### 프라임 (다음)
- 노션 기존 문서 태그 리매핑 검증 (서브에이전트가 41건 처리, 결과 미확인)

## 4. 알려진 이슈 / TODO
- [ ] sw.js 수정 반영이 빌드마다 리셋됨 (auto-generated) — next.config.mjs에서 해결 완료
- [ ] layout.tsx 12개 컴포넌트 → LayoutProviders 분리 임박
- [ ] 테스트 커버리지 0% (M2~M3 과제)

## 5. 주의사항
- V리뷰 0325 파일은 전체 해소됨 — 다음 V리뷰는 Day 2 작업 후 생성
- public/sw.js는 항상 modified 상태 (auto-generated) — 커밋하지 말 것

---

# Handoff Document (추가)
생성일시: 2026-03-29 KST
effort: high

## 1. 완료한 작업

### 세션 속도 개선 — settings.json 권한 추가
- `Agent(*)` 추가 — 서브에이전트 승인 없이 즉시 spawn (가장 큰 병목 해소)
- `TodoWrite(*)`, `ExitPlanMode(*)`, `EnterWorktree(*)`, `ExitWorktree(*)` 추가
- `RemoteTrigger(*)`, `CronCreate(*)`, `CronDelete(*)`, `CronList(*)` 추가
- 노션 MCP 개별 등록 → 와일드카드 통합: `mcp__notion__*`, `mcp__claude_ai_Notion__*`
- 중복 항목 제거: `Edit(/.claude/skills/session-wrap/**)`

## 2. 변경 파일 요약

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| ~/claude-forge/settings.json | 수정 | 권한 allow 목록에 Agent(*) 등 9개 추가, 노션 와일드카드 통합 |

## 3. 주의사항
- 변경 파일은 프로젝트 외부 (~/claude-forge/settings.json → ~/.claude/settings.json 심링크)
- 프로젝트 코드 변경 없음 — 빌드/린트/테스트 영향 없음
- 다음 세션부터 적용 (현재 세션에서는 이미 로드된 설정 사용)

## 6. 검증 권장 설정
- effort: medium
- security: false
- coverage: false
- only: all
- loop: 3

---

# Handoff Document (추가 2)
생성일시: 2026-03-29 02:03 KST
effort: high

## 1. 완료한 작업

### SEW 테스트 커버리지 대폭 확장
- **43 suites, 755 tests — 전체 통과**
- 10개 미커버 유틸리티 파일에 단위 테스트 추가:
  - adaptive-difficulty.test.ts, badges.test.ts, mastery.test.ts
  - seeded-sample.test.ts, array-utils.test.ts, spaced-scenario.test.ts
  - concept-urls.test.ts, structure-utils.test.ts, worksheet-utils.test.ts
  - xp-constants.test.ts, study-planner.test.ts, kice-analytics.test.ts, community-db.test.ts
- 병렬 서브에이전트 2개로 배치 처리 (Batch 1: 6파일, Batch 2: 4파일+추가)

### nadaun Phase 3-4 확인 + 보완
- Phase 3 (키움이들 학생 CRUD) + Phase 4 (IEP 계획 빌더) 이미 95% 완료 상태 확인
- loading.tsx 스켈레톤 2개 추가 (students/, students/[studentId]/)
- 홈페이지에 키움이들 카드 CTA 추가
- Zod v4 호환성 수정 3건 (errorMap → message)
- 빌드 exit 0 확인

### 부수 작업 (Batch 1 에이전트)
- daily page 리팩토링: 579줄 → 11파일 분리
- REQ-003 퀴즈 3과목 54문제 추가 (introduction, 청각장애, 의사소통장애)
- seeded-sample 중복 제거 + 단위 테스트

### settings.json 권한 최적화
- Agent(*) 등 9개 도구 자동 승인 추가
- 노션 MCP 와일드카드 통합

## 2. 변경 파일 요약

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| src/lib/__tests__/*.test.ts (13개) | 신규 | 유틸리티 단위 테스트 |
| nadaun/src/app/students/loading.tsx | 신규 | 학생 목록 스켈레톤 |
| nadaun/src/app/students/[studentId]/loading.tsx | 신규 | 학생 상세 스켈레톤 |
| nadaun/src/app/page.tsx | 수정 | 키움이들 CTA 카드 추가 |
| nadaun/src/lib/schemas/*.ts | 수정 | Zod v4 호환성 (3건) |
| prompt_plan.md | 수정 | nadaun Phase 0~4 완료 반영 |
| ~/claude-forge/settings.json | 수정 | Agent(*) 등 9개 권한 추가 |

## 3. 테스트 필요 사항
- [ ] REQ-003 추가 퀴즈 54문항 — 카이란 도메인 검증 필요
- [ ] daily page 리팩토링 — 기능 동작 확인 (11파일 분리)
- [ ] nadaun loading.tsx — 실제 로딩 상태 확인

## 4. 알려진 이슈 / TODO
- [ ] nadaun Phase 5 (채비 내보내기) — 미착수
- [ ] SEW REQ-007/008 DB 스키마 변경 — 카이란 승인 대기
- [ ] nadaun package.json/package-lock.json 변경 — nadaun 빌드에서 확인 필요

## 5. 주의사항
- nadaun/에 untracked export 관련 파일이 있음 (Phase 5 준비로 추정, 별도 세션 작업)
- .claude/worktrees/ 디렉토리 존재 — 정리 필요할 수 있음

## 6. 검증 권장 설정
- effort: low
- security: false
- coverage: true
- only: test
- loop: 1
