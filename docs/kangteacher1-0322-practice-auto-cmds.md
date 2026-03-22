# 강선생1 실행 커맨드 — 실력쌓기 수정 (2026-03-22)
작성: 스미스 프라임

> 세션 열면 아래 Step 순서대로 복붙 실행.

---

## Step 1 — ChapterTracker 버그 2건

```
/auto --mode bugfix 과목학습 ChapterTracker 컴포넌트 버그 2건 수정. 파일: src/components/chapter/ChapterTracker.tsx. 버그1(라인 26-33): useEffect 의존성 배열이 [subjectSlug, subjectTitle, chapterSlug, chapterTitle]로 되어있어 props가 바뀔 때마다 recordActivity 중복 호출됨. 챕터 페이지는 마운트 시 한 번만 기록하면 되므로 의존성 배열을 [] 빈 배열로 변경. 버그2(라인 43-48): handleComplete 함수 내부 setTimeout의 cleanup 함수 return () => clearTimeout(timer)가 useCallback 반환값으로 되어있어 실제로 cleanup이 실행되지 않음. 컴포넌트 언마운트 시 타이머가 계속 실행되는 메모리 누수. 수정방법: timer ID를 useRef로 저장하고 useEffect cleanup에서 clearTimeout 호출하도록 분리. 완료 기준: tsc 에러 0건, build 성공
```

---

## 완료 후 검증

```bash
npx tsc --noEmit
npm run build
```

- [ ] `/subjects/[slug]/[chapter]` 접속 시 `recordActivity` 1회만 호출 확인 (콘솔 중복 없음)
- [ ] 학습완료 버튼 클릭 후 1.5초 내 페이지 이동 확인
