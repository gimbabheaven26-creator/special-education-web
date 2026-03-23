# 강선생1 지시서 — 용어사전 UX 개선

날짜: 2026-03-23
작성: 스미스 프라임
대상: 강선생1 (~/Projects/special-education-web)

---

## 배경

홈화면 "오늘의 단어" 카드를 탭하면 `/terms?q=단어` 페이지로 이동하는 구조였으나,
이동 후 해당 카드가 닫힌 상태로 표시되어 정의를 보려면 한 번 더 탭해야 하는 UX 문제가 있었다.
또한 단어에서 용어학습 페이지로 가는 경로가 불명확했다.

카이란 요청 사항:
1. 카드 탭 → 바텀시트로 정의 즉시 표시 (페이지 이동 없이)
2. 바텀시트 안에 "용어학습 페이지에서 보기" + "관련 문제 풀어보기(준비중)" 버튼 제공
3. 용어학습 페이지 이동 시 해당 과목 카드 자동 오픈

---

## 현재 상태 (스미스 프라임이 구현 완료)

스미스 프라임이 코드를 이미 작성했다. 강선생1은 **빌드 검증 + 커밋 + push**만 하면 된다.

### 변경된 파일

| 파일 | 변경 내용 |
|------|---------|
| `src/components/TodayTermCardClient.tsx` | **신규** — 바텀시트 UI 클라이언트 컴포넌트 |
| `src/components/TodayTermCard.tsx` | 서버 컴포넌트에서 TodayTermCardClient에 위임 |
| `src/app/terms/TermsClient.tsx` | `subject` URL 파라미터 읽기 + 해당 카드 `initialOpen` |

### 동작 흐름

```
홈화면 오늘의 단어 카드 탭
  → 바텀시트 오픈 (정의 전체 표시)
  → "용어학습 페이지에서 보기" 탭
  → /terms?q=단어&subject=과목
  → 해당 과목의 카드가 자동으로 열린 상태로 표시
```

---

## Step 1 — 빌드 검증 후 커밋/push

```
/auto --mode feature 오늘의 단어 바텀시트 UX 개선 — 구현 완료, 검증 후 커밋만 수행

[구현 완료 사항]
- src/components/TodayTermCardClient.tsx 신규 생성 (바텀시트 + 버튼 2개)
- src/components/TodayTermCard.tsx: Link → TodayTermCardClient로 교체
- src/app/terms/TermsClient.tsx:
  - TermCard에 initialOpen prop 추가 (line 14)
  - urlSubject = searchParams.get('subject') 추가
  - 검색결과 렌더링 시 term.subject === urlSubject이면 initialOpen={true} 전달

[검증 항목]
- pnpm build 에러 없음
- TypeScript 타입 에러 없음
- 홈화면 오늘의 단어 탭 → 바텀시트 표시
- 바텀시트 "용어학습 페이지에서 보기" 탭 → /terms 페이지에서 해당 카드 열림
- 바텀시트 "관련 문제 풀어보기" — 비활성(opacity-50) 상태인지 확인

[커밋 메시지]
feat(terms): 오늘의 단어 바텀시트 UX — 정의 즉시 표시 + 용어학습 페이지 연결
```

---

## 완료 기준

- [ ] `pnpm build` 성공 (에러 0)
- [ ] 커밋 1개 생성
- [ ] `main` 브랜치에 push 완료
