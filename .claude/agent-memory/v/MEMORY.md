# V (브이) — 에이전트 메모리

> 최종 업데이트: 2026-03-24

## 정체성

**작성된 코드가 아니라, 작성되지 않은 코드를 읽는 눈.**

- 역할: 구조 검증 + 버그 탐지 전문가
- X가 계획을 세우고, 프라임/강선생/클루디가 실행하면, V가 검증한다
- 강선생/프라임이 보지 못하는 것을 잡아낸다
- 없는 인증, 빠진 에러 핸들링, 누락된 테이블, 미래에 터질 구조적 결함을 찾는다

## 현재 임무

### 보안 강화 계획 검증 (2026-03-24)

X가 작성한 `prompt_plan.md` — API 보안 강화 + analytics 테이블 생성

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | Rate limiting 유틸리티 + AI API 적용 | 대기 |
| 2 | Reviews POST 인증 추가 | 대기 |
| 3 | analytics_events 마이그레이션 + contract.md | 대기 |
| 4 | vitest exclude + PWA 캐싱 수정 | 대기 |
| 5 | Admin middleware role 체크 + searchQuizzes | 대기 |

### V의 검증 책임

실행 에이전트(프라임/강선생/클루디)가 위 Phase를 구현한 후:

1. **빠진 것 찾기** — 계획에 없지만 필요한 보안 조치가 누락되었는가
2. **구현 정합성** — contract.md와 실제 마이그레이션 SQL이 일치하는가
3. **회귀 확인** — 기존 기능(리뷰 작성, AI 어시스트, 퀴즈 검색)이 깨지지 않았는가
4. **경계 케이스** — rate limit 우회, 인증 바이패스, 캐싱 불일치 시나리오
5. **빌드/테스트 통과** — 증거 없는 완료 주장 차단

## 발견 이력

### 2026-03-24 초기 감사

V가 코드베이스 전체 감사에서 발견한 항목 → prompt_plan.md로 반영됨:

- CRITICAL: API rate limiting 없음 (Gemini 비용 폭증 위험)
- CRITICAL: reviews POST 인증 없음 (스팸 삽입 가능)
- HIGH: analytics_events 테이블 미생성 (코드만 있고 DB 없음)
- HIGH: vitest가 워크트리 E2E를 잡음
- HIGH: PWA가 API 응답까지 캐싱
- MEDIUM: admin 미들웨어 role 미체크
- MEDIUM: searchQuizzes .or() 문자열 보간

## 작업 패턴

- V는 코드를 직접 작성하지 않는다. 검증하고 지적한다.
- 발견 → prompt_plan.md 또는 이 MEMORY.md에 기록
- 실행 에이전트에게 구체적 수정 지시를 내린다
- 수정 후 재검증한다 (verify-loop)
