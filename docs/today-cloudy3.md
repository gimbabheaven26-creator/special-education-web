# 클루디3 지시서 — 학습장애 MDX 변환

**날짜**: 2026-03-19
**에이전트**: 클루디3 (학습장애 영역 전담)
**CWD**: `~/Projects/special-education-web`

---

## 1. 배경

특수교육 임용 플랫폼(s-e-w)에 인터랙티브 개념 학습 콘텐츠를 추가하는 작업이다.
정서행동장애 영역(8개 MDX)은 클루디 Opus가 이미 완료했으며, 이번 세션에서는
**학습장애** 영역을 전담하여 동일한 품질의 MDX를 생성한다.

MDX는 임용 수험생이 읽는 핵심 콘텐츠다. 기출 포인트 중심, 숫자/기준 명시, 표 활용이 핵심.

---

## 2. 현재 상태

- **소스 파일 경로**: `~/Downloads/특수교육학/학습장애/벤티) 01.학습장애.pdf.md`
- **출력 경로**: `~/Projects/special-education-web/src/content/concepts/학습장애/`
- **참조 완성본**: `src/content/concepts/정서행동장애/01-기초이론.mdx` (포맷 기준)

---

## 3. 작업 경로

### STEP 1 — 구조 분석 (Opus 권장)
- `벤티) 01.학습장애.pdf.md` 전체 읽기
- `벤티) 01.학습장애_quiz.md` (있으면) 병행 읽기 → kiceKeywords 추출
- 섹션 수와 각 섹션의 핵심 개념 목록 작성
- MDX 파일 분할 계획 결정

### STEP 2 — MDX 생성 (Sonnet으로 전환 가능)
각 파일을 순서대로 생성:

**frontmatter 필수 필드**:
```yaml
---
title: 학습장애 — {섹션명}
description: {한 줄 요약}
subject: 학습장애
slug: {영문 or 한글 슬러그}
order: {숫자}
kiceKeywords:
  - {키워드1}
  - {키워드2}
lastUpdated: 2026-03-19
---
```

**본문 규칙**:
- H2(`##`)로 대섹션, H3(`###`)으로 소섹션
- 진단 기준 숫자 **반드시 명시** (예: "6개월 이상", "표준편차 1.5 이하")
- 불일치 모델 vs RTI 모델 비교 표 필수 (학습장애 핵심 쟁점)
- Mermaid 다이어그램 → 마크다운 표로 변환
- `> ⚠️ **기출 포인트**: ...` 블록 — 임용에 자주 나온 개념에 사용
- 읽기/쓰기/수학 하위 유형별 중재 접근법 구분 명시

### STEP 3 — 검증
```bash
cd ~/Projects/special-education-web
npm run build
```
빌드 exit 0 확인 필수.

### STEP 4 — 완료 보고
`~/.claude/notion-pending.json` 작성:
```json
{
  "title": "완료보고: 클루디3 학습장애 MDX 2026-03-19",
  "type": "세션기록",
  "tags": ["클루디3", "s-e-w", "MDX"],
  "content": "## 완료된 것\n- 학습장애 MDX {N}개 생성\n- 빌드 exit 0 ✅\n\n## 생성된 파일\n{파일 목록}\n\n## 미결\n{있으면 기록}"
}
```

---

## 4. 금지 사항

- `docs/contract.md` 수정 금지
- `src/content/concepts/자폐스펙트럼장애/`, `지적장애/` 건드리지 않음 (클루디1, 2 영역)
- Supabase 삽입 금지 — MDX 파일 생성만 담당
- 빌드 실패 시 수정 전 카이란에게 보고

---

## 5. 우선순위

1. **기출 포인트 정확도** — RTI 단계(3~4단계), 불일치 기준, 처리과정 결함 개념 정확히
2. **분량** — 정서행동장애 파일 당 평균 200~400줄 참고
3. **빌드 통과** — MDX 문법 오류 없어야 함

---

## 6. 모델 선택 가이드

| 상황 | 권장 모델 |
|------|---------|
| pdf.md 전체 읽고 섹션 계획 | Opus |
| MDX 파일 1개씩 생성 | Sonnet |
| 빌드 오류 디버깅 | Sonnet |

---

## 7. 참조 경로

| 항목 | 경로 |
|------|------|
| 포맷 기준 파일 | `src/content/concepts/정서행동장애/01-기초이론.mdx` |
| 소스 PDF 변환본 | `~/Downloads/특수교육학/학습장애/*.pdf.md` |
| 출력 디렉토리 | `src/content/concepts/학습장애/` |
| KICE 키워드 참조 | `data/terminology/kice-terms.json` |
| 용어사전 | `data/terminology/nise-dictionary.json` |
