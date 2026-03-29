# Generate Loading Skeleton

Next.js App Router 라우트용 `loading.tsx` 스켈레톤 파일을 자동 생성한다.

## 사용법

```
/generate-loading [route] [variant]
```

- **route**: `src/app/` 하위 경로 (예: `bookmarks`, `kice/analytics`)
- **variant**: 레이아웃 유형 — `list` | `grid` | `cards` | `stats` (기본: `list`)

## 실행 단계

1. **경로 확인**: `src/app/{route}/` 디렉토리 존재 여부 확인
   - 없으면 에러 출력 후 중단
   - 이미 `loading.tsx`가 있으면 덮어쓸지 확인

2. **기존 패턴 참조**: 같은 variant의 기존 loading.tsx를 읽어 스타일 일관성 확보
   - list: `src/app/reviews/loading.tsx` 참조
   - grid: `src/app/mastery/loading.tsx` 참조
   - cards: `src/app/community/loading.tsx` 참조
   - stats: `src/app/stats/loading.tsx` 참조

3. **파일 생성**: `src/app/{route}/loading.tsx`
   - 공통 래퍼: `max-w-4xl mx-auto px-4 py-6 space-y-6`
   - Skeleton import: `@/components/ui/Skeleton` (존재 시) 또는 inline div with `animate-pulse`
   - 해당 페이지의 `page.tsx`를 읽어 실제 레이아웃에 맞는 스켈레톤 구조 생성

4. **variant별 구조**:
   - `list`: 타이틀 바 + 반복 행 6~8개 (`h-12 rounded-lg`)
   - `grid`: 타이틀 바 + 2열 그리드 4~6개 카드
   - `cards`: 타이틀 바 + 단일 열 카드 3~4개 (높이 큼)
   - `stats`: 상단 요약 카드 3~4개 + 차트 영역 placeholder

5. **검증**: `npx tsc --noEmit src/app/{route}/loading.tsx` — 타입 에러 0

## 예시

```bash
/generate-loading reviews list
# → src/app/reviews/loading.tsx 생성

/generate-loading stats stats
# → src/app/stats/loading.tsx 생성 (통계 레이아웃)
```
