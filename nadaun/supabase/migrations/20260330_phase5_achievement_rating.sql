-- Phase 5: weekly_plans에 달성도 + 관찰 기록 컬럼 추가
-- 기존 데이터는 NULL 유지 (비파괴적 마이그레이션)

ALTER TABLE weekly_plans
ADD COLUMN IF NOT EXISTS achievement_rating text
CHECK (achievement_rating IS NULL OR achievement_rating IN ('not_met', 'met', 'exceeded'));

ALTER TABLE weekly_plans
ADD COLUMN IF NOT EXISTS observation_notes text;

COMMENT ON COLUMN weekly_plans.achievement_rating IS '달성도: not_met(미달), met(달성), exceeded(초과). NULL=미입력';
COMMENT ON COLUMN weekly_plans.observation_notes IS '관찰 기록 (교사 메모)';
