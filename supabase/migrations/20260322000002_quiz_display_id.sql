-- T-11: quiz_questions display_id 컬럼 추가
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS display_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_display_id ON quiz_questions(display_id) WHERE display_id IS NOT NULL;
