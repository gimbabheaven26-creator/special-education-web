# 강선생1 지시서 — Vercel Analytics + BetaFeedbackWidget

날짜: 2026-03-24
작성: 스미스 프라임
대상: 강선생1 (~/Projects/special-education-web)

---

## 배경

베타 테스터가 이미 활동 중이다. 그런데 지금 우리에게는 두 가지가 없다:

1. **사용자가 뭘 하는지 모른다** — Vercel Analytics 미연동. 페이지뷰/Core Web Vitals 데이터 0.
2. **피드백을 받을 창구가 없다** — 사용자가 불편함을 느껴도 리포트할 방법이 없다.

브레인스토밍 결론: Vercel Analytics가 가장 빠른 ROI (30분, 즉시 베타 데이터 수집 시작). BetaFeedbackWidget은 Discord 알림 없이 구현하면 "피드백 무덤"이 된다 — Discord 연동 필수.

---

## 현재 상태

### layout.tsx 현재 구조 (`src/app/layout.tsx` line 1-70)

```tsx
// 현재 마운트된 컴포넌트 (body 내부):
<ThemeProvider>
  <Header />
  <main>...</main>
  <Footer />
  <BottomTabBar />
  <ConditionalReviewPanel />
  <StudySessionTracker />
  <SyncManager />
</ThemeProvider>
```

### 환경변수 현황 (`.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL` — 있음
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — 있음
- `SUPABASE_SERVICE_ROLE_KEY` — 있음
- `DISCORD_WEBHOOK_URL` — **없음, Step 2에서 추가 필요**

### API 라우트 패턴 (`src/app/api/reviews/route.ts` 참고)

```typescript
import { NextRequest, NextResponse } from 'next/server';
// POST 핸들러: body.json() → 검증 → 처리 → NextResponse.json()
// 에러: console.error + NextResponse.json({ error: '...' }, { status: 500 })
```

---

## Step 1 — Vercel Analytics 연동 (30분)

```
/auto --mode feature Vercel Analytics + Speed Insights 연동

[배경]
베타 사용자가 활동 중이나 페이지뷰/Core Web Vitals 데이터가 전혀 없음.
@vercel/analytics + @vercel/speed-insights 설치 후 layout.tsx에 마운트.

[구현 대상]
1. 패키지 설치:
   npm install @vercel/analytics @vercel/speed-insights

2. src/app/layout.tsx 수정:
   - 상단 import 추가:
     import { Analytics } from '@vercel/analytics/react';
     import { SpeedInsights } from '@vercel/speed-insights/next';

   - </ThemeProvider> 바로 앞에 마운트:
     <Analytics />
     <SpeedInsights />

   최종 body 구조:
   <body>
     <ThemeProvider>
       <Header />
       <main>...</main>
       <Footer />
       <BottomTabBar />
       <ConditionalReviewPanel />
       <StudySessionTracker />
       <SyncManager />
     </ThemeProvider>
     <Analytics />
     <SpeedInsights />
   </body>

[검증 항목]
- npm run build 에러 없음
- TypeScript 타입 에러 없음
- layout.tsx에 Analytics, SpeedInsights import 확인

[커밋 메시지]
feat(analytics): Vercel Analytics + Speed Insights 연동 — 베타 페이지뷰 수집 시작
```

---

## Step 2 — 환경변수 준비 (강선생이 직접 할 일)

Step 3 (BetaFeedbackWidget) 시작 전, 카이란이 아래 두 곳에 `DISCORD_WEBHOOK_URL` 추가 필요:

### 2-A. `.env.local` 에 추가
```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/[채널ID]/[토큰]
```

Discord 서버 → 채널 우클릭 → Edit Channel → Integrations → Webhooks → New Webhook → Copy Webhook URL

추천 채널: **#피드백** (없으면 #dev-log 사용)

### 2-B. Vercel 환경변수에 추가
Vercel Dashboard → special-education-web → Settings → Environment Variables → `DISCORD_WEBHOOK_URL` 추가 (Production + Preview)

> 스미스 프라임이 확인 완료 후 강선생1에게 Step 3 시작 지시.

---

## Step 3 — BetaFeedbackWidget 구현

```
/auto --mode feature BetaFeedbackWidget 구현 — 베타 피드백 수집 + Discord 알림

[배경]
베타 테스터가 불편함을 느껴도 신고할 방법이 없음.
화면 우하단 고정 버튼 → 모달 → 피드백 제출 → Discord #피드백 채널 알림.
Discord 알림이 없으면 피드백이 DB에만 쌓이고 아무도 안 본다 (피드백 무덤).

[구현 대상]

### 파일 1: src/app/api/feedback/route.ts (신규)

POST 핸들러:
- body: { type: 'bug'|'suggestion'|'compliment', message: string, page: string }
- 검증: message 5~500자, type enum, page 문자열
- Discord Webhook 전송 (DISCORD_WEBHOOK_URL 환경변수):
  ```
  📢 **베타 피드백** [이모지]
  유형: [유형]
  페이지: [page]
  메시지: [message]
  시각: [KST]
  ```
  - bug → 🐛, suggestion → 💡, compliment → 🎉
- Supabase beta_feedback 테이블 저장:
  INSERT INTO beta_feedback (type, message, page, created_at)
  VALUES ($1, $2, $3, NOW())

  ⚠️ 테이블이 없으면 건너뜀 (콘솔 경고만). Discord 전송은 항상 시도.
- 성공: { success: true }
- Discord 환경변수 없으면: 콘솔 경고 후 DB 저장만 (500 반환 금지)

### 파일 2: src/components/BetaFeedbackWidget.tsx (신규, 'use client')

UI:
- 고정 버튼: 화면 우하단 fixed, bottom-20 right-4 (모바일 탭바 위)
  md:bottom-6 md:right-6 (데스크탑)
  버튼 텍스트: "피드백" 또는 💬 아이콘
  배경: bg-blue-600 hover:bg-blue-700, 텍스트 흰색, rounded-full, shadow-lg

- 모달 (버튼 클릭 시):
  - 제목: "베타 피드백 보내기"
  - 유형 선택: 3개 버튼 (🐛 버그, 💡 개선, 🎉 칭찬) — 하나만 선택 가능
  - textarea: placeholder="어떤 점이 불편하셨나요? 자유롭게 적어주세요 (5~500자)"
  - 현재 페이지 자동 포함: usePathname() 사용
  - 제출 버튼: "보내기"
  - 제출 중: 비활성화 + "전송 중..."
  - 성공: "감사합니다! 피드백이 전달됐어요 🙏" 후 모달 닫기
  - 실패: "전송에 실패했어요. 다시 시도해주세요."
  - 모달 외부 클릭으로 닫기

API 호출:
  fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, message, page: pathname })
  })

### 파일 3: src/app/layout.tsx 수정

SyncManager 다음 줄에 추가:
  import { BetaFeedbackWidget } from '@/components/BetaFeedbackWidget';
  ...
  <SyncManager />
  <BetaFeedbackWidget />   ← 추가

[검증 항목]
- npm run build 에러 없음
- TypeScript 타입 에러 없음
- 화면 우하단에 "피드백" 버튼 노출 확인
- 버튼 클릭 시 모달 오픈 확인
- DISCORD_WEBHOOK_URL 없을 때 빌드/런타임 에러 없음 (graceful degradation)

[커밋 메시지]
feat(feedback): BetaFeedbackWidget + /api/feedback — 베타 피드백 수집 + Discord 알림
```

---

## 실행 순서 요약

| 순서 | 작업 | 소요 시간 | 의존성 |
|------|------|---------|--------|
| Step 1 | Vercel Analytics 연동 | 30분 | 없음 — 즉시 시작 가능 |
| Step 2 | Discord Webhook URL 발급 | 5분 (카이란 직접) | Step 1 완료 후 병행 가능 |
| Step 3 | BetaFeedbackWidget 구현 | 60-90분 | Step 2 완료 후 |

---

## 금지사항

- `DISCORD_WEBHOOK_URL` 하드코딩 금지 — 반드시 `process.env.DISCORD_WEBHOOK_URL` 사용
- beta_feedback 테이블이 없어도 500 에러 반환 금지 — Discord 알림만 전송하고 success 반환
- BetaFeedbackWidget을 서버 컴포넌트로 만들지 말 것 — usePathname(), useState() 필요하므로 'use client' 필수
- 모달 z-index: 다른 fixed 컴포넌트(ReviewPanel, BottomTabBar)와 충돌 주의 — z-50 이상 사용

---

## 참고: Vercel 대시보드에서 확인

Analytics 연동 후 Vercel Dashboard → Analytics 탭에서 페이지뷰 확인 가능.
Speed Insights → 연동 후 Vercel Dashboard → Speed 탭에서 Core Web Vitals 확인.
첫 데이터는 배포 후 수분~수시간 내 표시됨.
