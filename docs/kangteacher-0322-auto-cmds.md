# 강선생 실행 커맨드 — 2026-03-22

> 세션 열면 아래 순서대로 복붙 실행. 각 커맨드 완료 후 다음 커맨드 실행.
> 상세 스펙: `docs/kangteacher-0322-diagnosis-fix.md`

---

## 실행 순서

### Step 1 — 워크시트 플로우 복구

```
/auto --mode bugfix 워크시트 목록에서 토픽 클릭 시 항상 "학습지를 찾을 수 없습니다" 표시되는 버그. 원인: 목록이 Supabase UUID로 링크하는데 뷰/정답 페이지가 localStorage에서 같은 id로 조회해서 항상 null. 수정: src/lib/db.ts에 getWorksheetTopicById(id) 함수 추가, src/app/worksheets/[id]/WorksheetViewClient.tsx 클라이언트 컴포넌트 신규 생성(정답토글+출력버튼), src/app/worksheets/[id]/page.tsx 서버컴포넌트 전환(Supabase 직접조회), src/app/worksheets/[id]/answers/page.tsx 서버컴포넌트 전환(동일). 상세 구현은 docs/kangteacher-0322-diagnosis-fix.md Task 1 참고
```

### Step 2 — 오늘학습 비로그인 + seed 버그

```
/auto --mode bugfix 오늘학습 두 가지 버그. 버그1: 비로그인 시 /api/daily-questions가 401 반환, 클라이언트는 "다시 시도"만 표시하고 로그인 안내 없음. 버그2: API는 UTC 날짜로 seed 계산, 클라이언트는 KST 날짜 사용 → 자정 근처 다른 문제 세트 반환. 수정: src/app/api/daily-questions/route.ts에서 getUser+401 블록 제거, today를 new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date())로 교체. 상세는 docs/kangteacher-0322-diagnosis-fix.md Task 2 참고
```

---

## 완료 확인

두 커맨드 완료 후:

```bash
npx tsc --noEmit
npm run build
```

- `/worksheets` 토픽 클릭 → 문제지 정상 표시
- `/worksheets/[id]/answers` 직접 접근 → 정답 정상 표시
- 비로그인 `/daily` → 문제 정상 로드
