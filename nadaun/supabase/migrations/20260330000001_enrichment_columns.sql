-- Phase 3: achievement_standards enrichment columns
-- 2022 개정 교육과정 성취수준 풀 + 교육과정 성취수준 + 적용 시 고려사항

-- considerations: 적용 시 고려사항 (text[])
ALTER TABLE public.achievement_standards
  ADD COLUMN IF NOT EXISTS considerations text[] NOT NULL DEFAULT '{}';

-- curriculum_levels: 교육과정 성취수준 3축 — [{knowledge_understanding, process_skills, values_attitudes}]
ALTER TABLE public.achievement_standards
  ADD COLUMN IF NOT EXISTS curriculum_levels jsonb NOT NULL DEFAULT '[]';

-- achievement_pool: 성취수준 풀 — {columns: string[], items: string[][]}
ALTER TABLE public.achievement_standards
  ADD COLUMN IF NOT EXISTS achievement_pool jsonb NOT NULL DEFAULT '{}';

-- teaching_references: 교수학습 참고자료 — [{title: string, items: string[]}]
ALTER TABLE public.achievement_standards
  ADD COLUMN IF NOT EXISTS teaching_references jsonb NOT NULL DEFAULT '[]';

COMMENT ON COLUMN public.achievement_standards.considerations IS '적용 시 고려사항 배열';
COMMENT ON COLUMN public.achievement_standards.curriculum_levels IS '교육과정 성취수준 3축 [{knowledge_understanding, process_skills, values_attitudes}]';
COMMENT ON COLUMN public.achievement_standards.achievement_pool IS '성취수준 풀 {columns: string[], items: string[][]}';
COMMENT ON COLUMN public.achievement_standards.teaching_references IS '교수학습 참고자료 [{title, items}]';
