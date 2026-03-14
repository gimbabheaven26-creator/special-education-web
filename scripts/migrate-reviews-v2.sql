-- Reviews v2: 클로즈드 베타 피드백 시스템
-- Supabase SQL Editor에서 실행

-- 1. 기존 path UNIQUE 제약 제거 (같은 페이지에 여러 리뷰 허용)
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_path_key;

-- 2. 새 컬럼 추가
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_name text DEFAULT '';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'
  CHECK (status IN ('pending', 'discussing', 'accepted', 'rejected'));

-- 3. 인덱스
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status);
CREATE INDEX IF NOT EXISTS idx_reviews_path ON reviews (path);

-- 4. RLS 유지 (읽기/쓰기 공개)
-- 기존 정책 그대로 유지
