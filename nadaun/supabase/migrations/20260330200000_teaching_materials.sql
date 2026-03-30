-- Phase 6: teaching_materials 테이블
-- 주간계획과 연계된 교수학습 자료 (링크, 파일, 메모)

CREATE TABLE IF NOT EXISTS teaching_materials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  weekly_plan_id uuid NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('link', 'file', 'note')),
  title text NOT NULL,
  content text,
  file_url text,
  mime_type text,
  file_size integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_teaching_materials_weekly_plan
  ON teaching_materials(weekly_plan_id);

-- RLS
ALTER TABLE teaching_materials ENABLE ROW LEVEL SECURITY;

-- 읽기: weekly_plan의 teacher_id 스코프
CREATE POLICY "teaching_materials_select" ON teaching_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weekly_plans wp
      JOIN iep_plans ip ON wp.iep_plan_id = ip.id
      WHERE wp.id = teaching_materials.weekly_plan_id
        AND ip.teacher_id = auth.uid()
    )
  );

-- 쓰기: 동일 스코프
CREATE POLICY "teaching_materials_insert" ON teaching_materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM weekly_plans wp
      JOIN iep_plans ip ON wp.iep_plan_id = ip.id
      WHERE wp.id = teaching_materials.weekly_plan_id
        AND ip.teacher_id = auth.uid()
    )
  );

CREATE POLICY "teaching_materials_update" ON teaching_materials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM weekly_plans wp
      JOIN iep_plans ip ON wp.iep_plan_id = ip.id
      WHERE wp.id = teaching_materials.weekly_plan_id
        AND ip.teacher_id = auth.uid()
    )
  );

CREATE POLICY "teaching_materials_delete" ON teaching_materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM weekly_plans wp
      JOIN iep_plans ip ON wp.iep_plan_id = ip.id
      WHERE wp.id = teaching_materials.weekly_plan_id
        AND ip.teacher_id = auth.uid()
    )
  );

COMMENT ON TABLE teaching_materials IS '교수학습 자료 — 주간계획별 링크/파일/메모 첨부';
COMMENT ON COLUMN teaching_materials.type IS 'link: URL, file: Storage 파일, note: 텍스트 메모';
COMMENT ON COLUMN teaching_materials.file_url IS 'Supabase Storage URL (type=file일 때)';
COMMENT ON COLUMN teaching_materials.mime_type IS 'MIME 타입 (type=file일 때)';
COMMENT ON COLUMN teaching_materials.file_size IS '파일 크기 바이트 (type=file일 때)';
