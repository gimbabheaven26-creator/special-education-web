# 개발 로그

## 2026-03-11 — Phase 1 완료 및 배포

### 완료 항목
- **프로젝트 초기 설정**: Next.js 14 + TypeScript + Tailwind v4 + shadcn/ui
- **과목 구조**: 7개 과목, 21개 챕터 (subjects 데이터 + 동적 라우팅)
- **퀴즈 시스템**: 객관식, OX, 단답형 (자동채점 + 성장 마인드셋 피드백)
- **플래시카드**: 라이트너 5단계 간격반복 시스템 (Zustand + localStorage)
- **상태 관리**: 학습진도, 북마크, 오답노트, 퀴즈기록 (4개 Zustand 스토어)
- **UI/UX 심리학 적용**: Progressive Disclosure, 자동채점, 성장 마인드셋 문구
- **배포**: GitHub → Vercel 자동 배포 연동
- **URL**: https://special-education-web.vercel.app

### 기술 스택
Next.js 14 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, localStorage, Fuse.js, MDX, Vercel

### 빌드
42페이지, 빌드 성공

---

## 다음 작업 (예정)
- [ ] 사용자 UI 피드백 수집 후 반영
- [ ] KICE 기출 수집 스크립트 (PDF 파싱)
- [ ] 콘텐츠 템플릿 구조화 (Google Docs → MDX)
- [ ] 스피드 퀴즈 모드 (타이머)
- [ ] 프린트 레이아웃 + QR 코드
- [ ] 서술형 퀴즈 타입 구현
