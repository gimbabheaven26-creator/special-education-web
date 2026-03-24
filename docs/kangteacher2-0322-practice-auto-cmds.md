# 강선생2 실행 커맨드 — 실력쌓기 수정 (2026-03-22)
작성: 스미스 프라임 | 참조: 강선생2 실력쌓기 3개 라우트 구조 검증 결과

> 세션 열면 아래 커맨드 복붙 실행.
> 빌드 확인 후 완료.

---

## Step 1 — 과목학습 퀴즈 진입점 연결

```
/auto --mode bugfix 과목 상세 페이지에서 퀴즈로 가는 진입점이 없는 버그 수정. 현재 상태: src/app/subjects/[slug]/page.tsx는 LearningTimeline(챕터 목록)만 렌더링하며 /quiz/[subject] 링크가 없음. /quiz/[subject] 라우트는 정상 동작하지만 subjects 페이지 플로우에서 고립됨(mastery·stats에서만 연결됨). 해결방법: src/app/subjects/[slug]/page.tsx의 과목 헤더 영역(description p 태그 아래, LearningTimeline 위)에 "과목 퀴즈 풀기" 링크 버튼 1개 추가 — href=/quiz/{subject.slug}, variant=default, Brain 아이콘(lucide-react). 기존 구조(Breadcrumb, LearningTimeline, 돌아가기 버튼) 변경 금지. 완료 기준: tsc 에러 0건, build 성공, /subjects/[slug] 접속 시 퀴즈 버튼 표시
```

---

## 참고 (수정 불필요 확인됨)

- `ExamClient.tsx:61` `questions[currentIndex]` — `goToQuestion`이 `index >= 0 && index < questions.length` 가드를 이미 포함. 범위 이탈 불가. 수정 불필요.
- `/interactive` — 하드코딩 데이터 의도된 설계. 수정 불필요.

---

## 완료 후 검증

```bash
npx tsc --noEmit    # 에러 0건 필수
npm run build       # exit 0 필수
```

수동 확인:
- [x] `/concepts/[subject]` 접속 → 퀴즈 버튼 표시 (subjects→concepts 흡수로 실제 위치 변경)
- [ ] 버튼 클릭 → `/quiz/[subject]` 정상 이동 (수동 확인 필요)

## 완료 메모

```
완료 날짜: 2026-03-24
완료한 것: Step 1 — 퀴즈 진입점 추가
실제 수정 위치: src/app/concepts/[subject]/page.tsx (subjects가 concepts로 흡수됨, ad4e00b)
퀴즈 버튼: dbSubject 존재 시 LearningTimeline 위에 표시, href=/quiz/{slug}
빌드 상태: tsc 0건 / build 188페이지 OK
```
