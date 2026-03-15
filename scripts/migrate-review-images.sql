-- 리뷰 이미지 지원 마이그레이션
-- Supabase Dashboard > SQL Editor에서 실행

-- 1. reviews 테이블에 image_urls 컬럼 추가
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT ARRAY[]::text[];

-- 2. Storage RLS: review-images 버킷 공개 업로드 허용
CREATE POLICY "Anyone can upload review images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'review-images');

CREATE POLICY "Anyone can view review images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'review-images');
