# 강선생1 실행 커맨드 — 2026-03-22
작성: 스미스 프라임

> 세션 열면 아래 순서대로 복붙 실행.
> 각 Step 완료 + 빌드 확인 후 다음 Step.

---

## Step 1 — 개념학습 kiceKeywords [object Object] 버그

```
/auto --mode bugfix 개념학습 상세 페이지에서 콜론(:) 포함 키워드가 [object Object]로 렌더링되는 버그. 원인: src/lib/concepts.ts의 getSubjectFiles()함수(133번줄)는 kiceKeywords에 map(toKeywordString)을 적용하지만 getMDXContent()함수(175번줄)는 fm.kiceKeywords ?? [] 로 toKeywordString 미적용 — YAML이 콜론 포함 문자열을 객체로 파싱할 때 불일치 발생. 실제 해당 키워드 예시: "고급 테크놀로지 (음성 출력 기기: 원버튼·다버튼·음성합성)", "학습 4단계: 습득·숙달·유지·일반화". 수정: src/lib/concepts.ts getMDXContent() 함수 175번줄에서 kiceKeywords: fm.kiceKeywords ?? [] 를 kiceKeywords: (fm.kiceKeywords ?? []).map(toKeywordString) 으로 변경. 1줄 수정. 완료 기준: tsc 에러 0건, build 성공
```

---

## Step 2 — 용어학습 데이터 누락 + 레이블 수정

```
/auto --mode bugfix 용어학습 두 가지 문제 수정. 문제1: src/app/terms/page.tsx의 SUBJECTS 배열에 unclassified 항목이 없어서 data/terminology/by-subject/unclassified.json의 108개 용어가 용어사전에 표시되지 않음. 문제2: SUBJECTS 배열 23번줄에 assessment 레이블이 "특수교육 평가"로 하드코딩되어 있는데 DB subjects.title은 "진단 및 평가"로 불일치. 수정: (1) SUBJECTS 배열에 { key: 'unclassified', label: '기타' } 항목 추가, (2) assessment 레이블을 "특수교육 평가" → "진단 및 평가"로 수정. 완료 기준: tsc 에러 0건, build 성공, /terms 페이지에서 108개 추가 용어 표시 확인
```

---

## 완료 후 검증

```bash
npx tsc --noEmit
npm run build
```

- [ ] `/concepts/AAC/도구기법과참여모델` 접속 → 기출키워드 뱃지 정상 텍스트 표시 (이전: [object Object])
- [ ] `/terms` 접속 → '기타' 섹션에 108개 용어 표시
- [ ] `/terms` 용어사전 '진단 및 평가' 레이블 확인
