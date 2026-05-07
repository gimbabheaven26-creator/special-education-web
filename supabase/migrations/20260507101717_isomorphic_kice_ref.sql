-- M4 Phase 3-2: 동형 문제↔기출 원본 연결
-- source_kice_ref 형식: '{year}/{session}/{number}' (e.g. '2026/전공A/5')
ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS source_kice_ref text DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_quiz_source_kice_ref
  ON quiz_questions (source_kice_ref)
  WHERE source_kice_ref IS NOT NULL;
