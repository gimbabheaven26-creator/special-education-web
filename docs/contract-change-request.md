# contract.md 변경 요청

요청자: 클루디2 | 날짜: 2026-03-22 | 현재 버전: v2.7

---

## 추가 요청

### reviews.image_urls — 미반영 필드

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| image_urls | text[] | NULL | 첨부 이미지 URL 목록 |

### 근거

`src/lib/review-db.ts`의 `saveReview` 함수에서 `image_urls` 필드를 사용 중이나 contract.md에 미반영:

```ts
// review-db.ts:saveReview
await supabase.from('reviews').upsert({
  path,
  content,
  reviewer_name: reviewerName,
  image_urls: imageUrls,   // ← 이 필드가 contract.md 누락
  updated_at: new Date().toISOString(),
}, { onConflict: 'path,reviewer_name' });
```

---

## 확인 완료 (변경 불필요)

### reviews.admin_note — v2.7에 반영 완료 ✅

contract.md v2.7에서 이미 추가됨:
> `admin_note | text | DEFAULT '' | 관리자 내부 메모 (v2.7 추가)`

---

## 요청 처리 방법

1. 스미스 프라임 또는 카이란이 이 파일 검토
2. 승인 시 contract.md v2.8로 업데이트 (reviews 테이블에 `image_urls` 행 추가)
3. 완료 후 이 파일 삭제
