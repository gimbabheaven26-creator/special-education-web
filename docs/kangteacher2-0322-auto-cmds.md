# 강선생2 실행 커맨드 — 2026-03-22
작성: 스미스 프라임 | 참조: 진단평가 4개 라우트 검증 결과 v2.0

> 세션 열면 아래 순서대로 복붙 실행.
> 각 Step 완료 + 빌드 확인 후 다음 Step 진행.
> 상세 스펙: `docs/kangteacher-0322-diagnosis-fix.md`

---

## Step 1 — 워크시트 뷰·정답 페이지 플로우 복구

```
/auto --mode bugfix 워크시트 목록에서 토픽 클릭 시 항상 "학습지를 찾을 수 없습니다" 표시되는 버그 수정. 원인: src/app/worksheets/page.tsx가 Supabase UUID로 링크하는데 src/app/worksheets/[id]/page.tsx와 [id]/answers/page.tsx가 loadWorksheet(id)로 localStorage에서 조회해서 항상 null 반환. 해결방법: (1) src/lib/db.ts에 getWorksheetTopicById(id) 함수 추가 — worksheet_topics 테이블에서 id로 단건 조회, (2) src/app/worksheets/[id]/WorksheetViewClient.tsx 신규 생성 — use client, 정답 토글(showAnswers useState)과 출력 버튼(window.print) 담당, QRCode 컴포넌트 포함, props: topicName/questions/qrUrl, (3) src/app/worksheets/[id]/page.tsx를 서버 컴포넌트로 전환 — use client 제거, getWorksheetTopicById(id)로 토픽 조회 후 없으면 notFound(), getWorksheetsByTopic(topic.subject, id)로 문제 조회, QR URL은 process.env.NEXT_PUBLIC_SITE_URL 환경변수 사용, WorksheetViewClient에 데이터 전달, (4) src/app/worksheets/[id]/answers/page.tsx도 동일하게 서버 컴포넌트로 전환 — loadWorksheet 제거, getWorksheetTopicById+getWorksheetsByTopic으로 교체, 정답/해설 목록 직접 렌더링(인터랙션 없으므로 클라이언트 컴포넌트 불필요). 완료 기준: tsc 에러 0건, build 성공, /worksheets 토픽 클릭 시 문제지 정상 표시
```

---

## Step 2 — 오늘학습 비로그인 허용 + KST seed 통일

```
/auto --mode bugfix 오늘학습 두 가지 버그 수정. 버그1: src/app/api/daily-questions/route.ts 21번째 줄에서 비로그인 시 401 반환, 클라이언트는 재시도 버튼만 표시하고 로그인 안내 없어서 사용 불가. 버그2: API는 new Date().toISOString().slice(0,10)으로 UTC 날짜 기준 seed 생성, 클라이언트 daily/page.tsx는 getKSTDateRaw()로 KST 날짜 사용 — 자정 기준 최대 9시간 구간에서 다른 문제 세트 반환. 해결방법: src/app/api/daily-questions/route.ts에서 (1) supabase.auth.getUser() 호출과 if (!user) return 401 블록 2줄 삭제, (2) const today = new Date().toISOString().slice(0, 10) 을 import { getKSTDateRaw } from '@/lib/sheet-code' 추가 후 const today = getKSTDateRaw() 로 교체. 나머지 seededRandom, seededSample, quiz 조회 로직은 그대로 유지. 완료 기준: tsc 에러 0건, build 성공, 비로그인 /daily 접속 시 문제 정상 로드
```

---

## 완료 후 검증

```bash
npx tsc --noEmit    # 에러 0건 필수
npm run build       # exit 0 필수
```

수동 확인 체크리스트:
- [ ] `/worksheets` 목록 → 토픽 클릭 → 문제지 정상 표시
- [ ] `/worksheets/[id]/answers` 직접 URL 접근 → 정답·해설 정상 표시
- [ ] 비로그인 상태 `/daily` 접속 → 문제 정상 로드 (401 에러 없음)
- [ ] KST 기준 날짜로 seed 생성 확인 (코드 리뷰로 확인)
