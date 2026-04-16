-- Phase 5-B: AI 검수 파이프라인 — quiz_questions에 ai_status, ai_generated_at 추가
-- contract.md v2.15

ALTER TABLE quiz_questions
  ADD COLUMN IF NOT EXISTS ai_status text DEFAULT 'human'
    CHECK (ai_status IN ('human', 'draft', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS ai_generated_at timestamptz DEFAULT NULL;

-- 기존 데이터는 모두 'human' (DEFAULT로 자동 적용)
COMMENT ON COLUMN quiz_questions.ai_status IS 'human=수동생성, draft=AI초안, approved=승인, rejected=거절';
COMMENT ON COLUMN quiz_questions.ai_generated_at IS 'AI가 초안을 생성한 시각';
