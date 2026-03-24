# 강선생2 지시서: Vercel Analytics + BetaFeedbackWidget

/auto --mode feature Vercel Analytics 연동 + 베타 피드백 위젯

## 참고 문서
- 프라임 원본 지시서: docs/kangteacher1-0324-analytics-beta-feedback-auto-cmds.md
- X 스프린트 계획: prompt_plan.md (M1 안전망)

## Step 1: Vercel Analytics 연동 (30분, 즉시 시작)

### 설치
```bash
npm install @vercel/analytics
```

### 적용
- `src/app/layout.tsx`에 `<Analytics />` 컴포넌트 추가
- import: `import { Analytics } from '@vercel/analytics/react'`
- `<body>` 닫기 태그 직전에 배치

### 검증
- npm run build → exit 0
- 로컬에서 페이지 이동 시 콘솔에 analytics 이벤트 확인
- Vercel 대시보드에서 데이터 수집 확인 (배포 후)

## Step 2: BetaFeedbackWidget (60~90분, Discord URL 필요)

### 전제조건
- 환경변수 `DISCORD_WEBHOOK_URL` 필요 — 카이란이 Discord에서 발급
- 없으면 Step 1만 완료하고 대기

### 구현
- `src/components/BetaFeedbackWidget.tsx` 신규 생성
- 하단 우측 플로팅 버튼 (💬 아이콘)
- 클릭 시 간단한 폼: 피드백 유형 (버그/제안/칭찬) + 텍스트 입력
- 제출 시 Discord webhook으로 전송
- API 라우트: `src/app/api/feedback/route.ts`
  - POST: { type, message, page, userAgent }
  - Discord embed 형식으로 전송
  - 환경변수 없으면 console.warn만

### UI 요구사항
- 모바일에서도 잘 보이게 (하단 우측 고정)
- 다크모드 지원
- 제출 후 "감사합니다! 소중한 의견이에요 🙏" 메시지
- 카이란 요구: "혼이 느껴지는" 문구 — 기계적이지 않게

### 검증
- npx tsc --noEmit → 0 에러
- npm run build → exit 0
- 위젯이 모든 페이지에서 보이는지 확인
- Discord webhook 테스트 (WEBHOOK_URL 있을 때)

## 참고: M1 강선생1 작업과 충돌 방지

강선생1은 감성 + UX 9개 작업 (auto-kangseonsaeng-m1.md) 진행 중.
강선생2는 Analytics + Feedback만 담당. 파일 충돌 없음:
- 강선생2: layout.tsx (Analytics 1줄 추가), BetaFeedbackWidget (신규), api/feedback (신규)
- 강선생1: error.tsx들, 네비게이션, 빈 상태, 마이크로카피 등

layout.tsx만 겹칠 수 있으니 Analytics 추가는 최소 변경(1줄)으로 제한.
