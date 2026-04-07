---
description: TS 타입 변경 시 테스트 fixture 자동 동기화. 타입↔fixture 불일치 방지.
---
# Fixture Sync

TypeScript 타입 변경 시 테스트 fixture 자동 동기화.

## 사용법

```
/fixture-sync [--check | --fix]
```

- `--check` (기본): tsc 에러 탐지 + 수정 필요 목록 출력
- `--fix`: 자동 수정 시도

## 문제 상황

도메인 타입에 required 필드가 추가되면 기존 테스트 fixture가 컴파일 에러 발생:
```
ExamEntry에 filename 추가 → kice-analytics.test.ts의 모든 ExamEntry fixture 깨짐
KiceExam에 exam 추가 → structure-utils.test.ts의 모든 KiceExam fixture 깨짐
```

## Check 모드 (--check)

1. `npx tsc --noEmit 2>&1` 실행
2. 테스트 파일(`**/__tests__/**`, `**/*.test.ts`)의 에러만 필터링
3. 에러 유형 분류:
   - **missing property**: fixture 객체에 required 필드 누락
   - **type mismatch**: 필드 타입 변경 (number → string 등)
   - **other**: 그 외 타입 에러

4. 출력:

```
## Fixture Type Errors (N건)

| # | 파일 | 라인 | 타입 | 누락/변경 필드 | 원본 타입 |
|---|------|------|------|---------------|----------|
| 1 | kice-analytics.test.ts | 23 | missing | filename | ExamEntry |
| 2 | structure-utils.test.ts | 45 | mismatch | session: number→string | ExamEntry |
```

## Fix 모드 (--fix)

1. Check 모드 실행하여 에러 목록 수집
2. 각 에러에 대해:
   - **missing property**: 원본 타입 정의를 읽어 기본값 추론
     - `string` → `'test-value'` 또는 fixture 컨텍스트에서 추론
     - `number` → `0`
     - `boolean` → `false`
     - 복합 타입 → `as unknown as Type` 캐스트 제안
   - **type mismatch**: 기존 값을 새 타입으로 변환
     - `session: 1` → `session: '1'` (number→string)
3. Edit 적용 후 `npx tsc --noEmit` 재검증
4. 여전히 에러 있으면 → 수동 검토 필요 목록 출력

## 주의사항

- `as unknown as Type` 이중 캐스트는 partial mock에만 사용
- fixture 값은 테스트 의도에 맞게 설정 — 무의미한 기본값보다 컨텍스트 추론 우선
- 3회 이상 같은 에러 반복 시 중단하고 수동 검토 요청
- `replace_all`로 키 이름만 교체하면 기존 값과 충돌 — 반드시 `key: value` 전체를 교체
