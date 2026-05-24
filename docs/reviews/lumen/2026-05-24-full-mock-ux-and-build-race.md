# SEW Next Full Mock UX and Build Race Check

Date: 2026-05-24
Reviewer: Lumen

## Scope

- `/next/practice?mode=mock&variant=full` 실전형 23문항 UX 직접 체험
- `/record` Mock Exam 전공A/B 추세의 다음 행동성 점검
- Next 14 manifest race 재현 여부 확인

## Full Mock UX Smoke

Target: `https://special-education-web.vercel.app/next/practice?mode=mock&variant=full`

Result:

- 23문항 실전형 세션 진입 PASS
- `180:00` 제한시간, 전공A/B 구조, 공식 23문항 기준 표시 PASS
- 23문항 연속 제출 PASS
- `Mock Exam 리포트`, `시험지별 결과`, `다음 처방` 표시 PASS
- `quizHistory`에 `sew-next-mock-full` 23건 저장 PASS
- 저장 메타 샘플: `전공A`, `2교시`, `1번`, `단답형`, `2점`, `full`
- page error 0

Screenshots:

- `/tmp/sew-next-full-mock-ux/01-start.png`
- `/tmp/sew-next-full-mock-ux/02-report.png`

## UX Notes

- 좋은 점: 첫 화면에서 공식 23문항, 전공A/B, 배점 구조가 즉시 보인다. 사용자가 "진짜 시험 구조"라는 감각을 얻기 쉽다.
- 마찰: 23문항을 한 번에 끝까지 풀면 리포트가 화면 하단에 길게 붙는다. 학습 피로가 큰 날에는 리포트 위치를 놓칠 수 있다.
- 신뢰: 시험지별 40/40점 카드와 문항별 메타 저장은 `/record` 추세로 이어질 근거가 충분하다.
- 다음 개선: `/record`에서 단순 추세보다 "어느 교시에서 무엇을 더 풀지"가 바로 보여야 재방문 이유가 생긴다.

## Build Race Check

Commands:

```bash
rm -rf .next && NEXT_PRIVATE_BUILD_WORKER=0 npm run build
rm -rf .next && npm run build
```

Result:

- Worker disabled clean build PASS, 203 pages.
- Normal clean build PASS, 203 pages.
- 2026-05-23에 관찰한 `Unexpected end of JSON input` manifest race는 이번 상태에서 재현되지 않았다.

Decision:

- manifest race는 현 시점에서 코드 수정 대상이 아니라 관찰 이슈로 유지한다.
- 재현되면 `rm -rf .next && NEXT_PRIVATE_BUILD_WORKER=0 npm run build`를 신뢰 가능한 로컬 게이트로 사용한다.

