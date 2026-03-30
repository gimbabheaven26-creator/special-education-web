-- Phase 4: weekly_plans에 status + progress_notes 컬럼 추가
-- 기존 데이터는 'planned' 기본값으로 유지

ALTER TABLE weekly_plans
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'planned'
CHECK (status IN ('planned', 'in_progress', 'completed'));

ALTER TABLE weekly_plans
ADD COLUMN IF NOT EXISTS progress_notes text;

COMMENT ON COLUMN weekly_plans.status IS '주간계획 진행 상태: planned(예정), in_progress(진행 중), completed(완료)';
COMMENT ON COLUMN weekly_plans.progress_notes IS '교사 진도 메모';
