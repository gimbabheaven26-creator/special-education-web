# nadaun Phase 2 — 성취기준 탐색 UI

> 확정일: 2026-03-28 | 승인: 카이란

## 목표

교사 로그인 후 4과목 89개 성취기준을 계층적으로 탐색: 과목 → 영역 → (하위영역) → 상세 + 검색.

## 데이터 (DB 실제 기준)

| 과목 | slug | 영역 수 | 성취기준 | sub_domain |
|------|------|---------|---------|------------|
| 국어 | korean | 3 | 14 | 없음 |
| 수학 | math | 5 | 33 | 전 영역 있음 |
| 생활영어 | english | 3 | 15 | 없음 |
| 진로와직업 | career | 6 | 27 | 없음 |

## 라우팅

```
/standards                                    → 과목 선택 (4카드)
/standards/[subject]                          → 영역 목록
/standards/[subject]/[domainCode]             → 성취기준 목록 (수학: sub_domain 탭)
/standards/[subject]/[domainCode]/[code]      → 상세
/standards/search                             → 검색 + 필터
```

## 구현 단계

### Phase 2A: 데이터 레이어
- `src/lib/utils/subject-map.ts` — slug ↔ DB name, 과목 메타
- `src/lib/queries/achievement-standards.ts` — 5개 쿼리 함수
- 테스트: subject-map.test.ts, achievement-standards.test.ts

### Phase 2B: 계층 탐색 UI
- 4개 라우트 페이지
- 10개 컴포넌트 (subject-card, domain-card, sub-domain-tabs, standard-list, content-elements 등)
- 레이아웃 + breadcrumb
- shadcn: accordion, breadcrumb, skeleton

### Phase 2C: 검색 & 필터
- /standards/search/page.tsx (Server)
- search-form.tsx (Client), search-results.tsx (Server)
- shadcn: select

### Phase 2D: 접근성 & 폴리시
- loading.tsx 3개, not-found.tsx 2개
- content-elements.test.tsx
- WCAG AA: aria-label, 키보드, 320px 모바일

## 설계 결정

| 결정 | 이유 |
|------|------|
| Server Component 전면 | 89행, 캐시 불필요, RLS 서버 쿠키 |
| 수학 sub_domain → ?sub= 쿼리파라미터 | 추가 라우트 깊이 회피 |
| 클라이언트 상태 없음 | URL 파라미터만으로 탐색 |
| KU 타입 가드 순수 함수 | 유닛 테스트 용이 |

## Completion Contract (16개 — 13/16 = PASS)

- [ ] C1: /standards에 4과목 카드 + 정확한 수
- [ ] C2: 과목 클릭 → 영역 목록
- [ ] C3: 비수학 영역 → 성취기준 직접 목록
- [ ] C4: 수학 영역 → sub_domain 탭
- [ ] C5: 수학 sub_domain 필터 동작
- [ ] C6: 상세 페이지 전체 필드 렌더
- [ ] C7: 4과목 KU 형태별 정확한 렌더
- [ ] C8: Breadcrumb 전체 경로
- [ ] C9: 텍스트 검색 결과
- [ ] C10: 과목+영역 필터 동작
- [ ] C11: 320px 가로 스크롤 없음
- [ ] C12: 키보드 탐색 가능
- [ ] C13: 쿼리 함수 테스트 통과
- [ ] C14: 유틸 테스트 통과
- [ ] C15: content-elements 테스트 통과
- [ ] C16: 800줄/50줄 제한 준수
