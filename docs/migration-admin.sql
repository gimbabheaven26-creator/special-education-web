-- ============================================================
-- Migration: 어드민 시스템 스키마 보강
-- Date: 2026-03-23
-- Author: V (v-0322.night)
--
-- 실행 전 반드시 백업:
--   CREATE TABLE profiles_backup AS SELECT * FROM profiles;
-- ============================================================

BEGIN;

-- 1. quiz_questions 추적 컬럼 추가
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS updated_by text;

-- 2. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_quiz_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quiz_questions_updated_at ON quiz_questions;
CREATE TRIGGER quiz_questions_updated_at
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_quiz_updated_at();

-- 3. profiles에 role 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 4. 현재 사용자를 admin으로 승격 (필요 시 이메일 변경)
-- UPDATE profiles SET role = 'admin' WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'your-email@example.com'
-- );

COMMIT;

-- ============================================================
-- 검증 쿼리
-- ============================================================
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'quiz_questions' AND column_name IN ('updated_at', 'updated_by');
--
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name = 'role';
