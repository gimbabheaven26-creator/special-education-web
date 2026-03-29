# EmptyState Migrator

인라인 빈 상태 UI를 공유 `EmptyState` 컴포넌트로 마이그레이션한다.

## 사용법

```
/empty-state-migrator [--audit | --migrate [file]]
```

- `--audit` (기본): 전체 스캔, 후보 목록 출력
- `--migrate [file]`: 특정 파일 또는 전체 마이그레이션 실행

## 감지 패턴

다음 패턴을 인라인 빈 상태로 간주:

```
1. .length === 0  또는  !items.length  분기 내부에
2. 텍스트 메시지 JSX (p, span, div with "없" "아직" "비어" 등)
3. 아이콘/이모지 + 안내 문구 조합
```

## Audit 모드 (--audit)

1. **Grep 스캔**: `src/app/` 전체에서 감지 패턴 탐색
2. **이미 EmptyState 사용 중인 파일 제외**
3. **출력 형식**:

```
## EmptyState 마이그레이션 후보 (N건)

| # | 파일 | 라인 | 현재 패턴 | 난이도 |
|---|------|------|----------|--------|
| 1 | src/app/mastery/page.tsx | 45 | inline div + emoji | 쉬움 |
| 2 | src/app/my/page.tsx | 112 | 커스텀 레이아웃 | 어려움 |
```

난이도 기준:
- **쉬움**: 텍스트+CTA만 있어 EmptyState props로 1:1 매핑 가능
- **보통**: 아이콘 커스텀 필요 (icon prop 활용)
- **어려움**: 커스텀 레이아웃/다중 CTA — EmptyState API 확장 또는 유지

## Migrate 모드 (--migrate)

1. 대상 파일의 인라인 빈 상태 코드 읽기
2. EmptyState props 매핑:
   - 텍스트 → `title` + `description`
   - 링크/버튼 → `action: { label, href, ariaLabel }`
   - 아이콘 → `icon` (Lucide 컴포넌트 또는 이모지)
3. `import { EmptyState } from '@/components/ui/EmptyState'` 추가
4. 인라인 코드를 `<EmptyState ... />` 로 교체
5. `npx tsc --noEmit` 검증
6. 난이도 "어려움" 파일은 건너뛰고 수동 검토 추천

## EmptyState API 참조

```tsx
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;          // Lucide icon 또는 이모지
  action?: {
    label: string;
    href: string;
    ariaLabel?: string;
  };
}
```

## 주의사항

- 커스텀 레이아웃(stats 대시보드, 진단 결과 등)은 강제 마이그레이션하지 않음
- `role="status"` + `aria-live="polite"` 접근성은 EmptyState에 내장됨
- 마이그레이션 후 시각적 차이가 있을 수 있음 — 스타일 확인 필수
