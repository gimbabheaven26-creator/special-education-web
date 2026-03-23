# 강선생2 실행 커맨드 — KICE 모의고사 버그 2건 (2026-03-23)
작성: 스미스 프라임 | 참조: 강선생2 실력쌓기 KICE 라우트 검증 결과

> 세션 열면 아래 Step 순서대로 복붙 실행.
> 각 Step 완료 + 빌드 확인 후 다음 Step 진행.

---

## Step 1 — ExamClient answers 상태 초기화 버그

```
/auto --mode bugfix 모의고사 연도/세션 변경 시 이전 시험 답안 상태가 유지되는 버그 수정. 원인: src/app/kice/exam/page.tsx가 ExamClient에 key prop 없이 렌더링 — router.push로 URL 변경 시 React가 ExamClient를 unmount 대신 re-render해서 answers useState 초기화 함수가 재실행되지 않음. 결과: 문항 수가 다른 시험으로 전환 시 answers.length !== exam.questions.length 불일치 → answer.blanks 접근 시 undefined 크래시. 해결방법: src/app/kice/exam/page.tsx의 <ExamClient ... /> 에 key={`${selectedYear}-${selectedSession}`} prop 추가. ExamClient 코드 자체는 변경 금지. 완료 기준: tsc 에러 0건, build 성공
```

---

## Step 2 — 기본 선택 시험이 동형으로 잘못 설정되는 버그

```
/auto --mode bugfix URL 파라미터 없이 /kice/exam 접속 시 기본 선택이 실제 기출이 아닌 동형 시험으로 표시되는 버그 수정. 원인: src/lib/kice.ts getAvailableExams()에서 readdirSync가 macOS HFS+ 순서로 전공A-동형.json을 전공A.json보다 먼저 반환 → entries[0].session = 전공A-동형. page.tsx에서 URL params 없을 때 entries[0]을 기본값으로 사용하므로 동형 시험이 기본 선택됨. 해결방법: getAvailableExams() 내 files 배열에 정렬 추가 — files.sort((a, b) => { const score = (f: string) => (f.includes('예상') ? 2 : 0) + (f.includes('동형') ? 1 : 0); return score(a) - score(b); }); — 실제 기출(점수 0)이 동형(1)·예상(2)보다 앞에 오도록. 완료 기준: tsc 에러 0건, build 성공, 파라미터 없이 /kice/exam 접속 시 전공A(동형 아님)가 기본 선택됨
```

---

## 완료 후 검증

```bash
npx tsc --noEmit    # 에러 0건 필수
npm run build       # exit 0 필수
```

수동 확인 체크리스트:
- [ ] `/kice/exam` 파라미터 없이 접속 → 전공A(동형·예상 아님)가 기본 선택
- [ ] 시험 시작 → 연도/세션 변경 → setup 화면 → 다시 시작 → 크래시 없음
