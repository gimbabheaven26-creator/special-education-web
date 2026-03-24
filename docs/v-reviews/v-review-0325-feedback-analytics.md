# V 검증: 강선생1 커밋 2건 (Analytics + Feedback)

검증일: 2026-03-25
대상: c749376 (Analytics), 3898c54 (Feedback)
판정: MEDIUM

## 발견 사항

| # | 항목 | 심각도 | 담당 | 상태 |
|---|------|--------|------|------|
| 1 | /api/feedback rate limiting 없음 | MEDIUM | 강선생1 | OPEN |
| 2 | Discord 메시지 인젝션 (@everyone) | MEDIUM | 강선생1 | OPEN |
| 3 | page 파라미터 미검증 (길이 제한 없음) | LOW | 강선생1 | OPEN |
| 4 | setTimeout 클린업 누락 | LOW | 강선생1 | DEFERRED |

## 상세

### 1. rate limiting 없음
- 위치: `src/app/api/feedback/route.ts:8`
- 문제: 인증 없는 공개 POST. 무한 호출 가능 → Discord 스팸 + Vercel 비용
- 제안: IP당 분당 3회. prompt_plan.md Phase 1 rate-limit 유틸리티와 통합

### 2. Discord 인젝션
- 위치: `src/app/api/feedback/route.ts:27`
- 문제: message/page가 그대로 Discord 전송. @everyone 멘션 가능
- 제안: `const sanitize = (s: string) => s.replace(/@(everyone|here)/gi, '@\u200B$1');`

### 3. page 미검증
- 위치: `src/app/api/feedback/route.ts:12`
- 문제: 타입/길이 검증 없음. 10MB 문자열 가능
- 제안: `typeof page === 'string' && page.length < 200`

### 4. setTimeout 클린업
- 위치: `src/components/BetaFeedbackWidget.tsx:43-45`
- 문제: useEffect + clearTimeout 패턴 미사용
- 판단: 실질적 영향 미미. DEFERRED

## 구조 우려 (감시 항목)
- layout.tsx에 컴포넌트 9개 누적 중. 2~3개 추가 시 `<LayoutProviders>` 래퍼 분리 필요.

## PASS 항목
- Vercel Analytics + Speed Insights: 깨끗함. 표준 패키지, 올바른 위치.
