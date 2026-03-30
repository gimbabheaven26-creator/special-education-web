-- Phase 3: iep_plans.goals JSONB에 present_level 필드 지원
-- goals 구조: [{ achievement_standard_id, achievement_standard_code, description, target_level, present_level? }]
-- present_level 구조: { levels: [{axis, selected_index, selected_text}], notes: string, recommended_target: string }
--
-- JSONB이므로 별도 migration 불필요 — 이 파일은 문서화 목적.
-- 기존 goals에 present_level이 없어도 코드에서 optional로 처리.

-- 변경 없음 (JSONB 유연성 활용)
SELECT 1;
