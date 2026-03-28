-- Phase 1: 나다운 DB 스키마
-- 5 tables: achievement_standards, teachers, students, iep_plans, weekly_plans
-- RLS: achievement_standards 읽기 공개, 나머지 teacher_id 스코프

-- ============================================================
-- 0. updated_at 자동 갱신 트리거 함수
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. achievement_standards (성취기준 90개)
-- ============================================================
CREATE TABLE public.achievement_standards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject     text NOT NULL,                -- 국어, 수학, 진로와 직업, 생활영어
  curriculum  text NOT NULL DEFAULT '2022 개정 기본교육과정',
  grade_group text NOT NULL,                -- 중학교 1~3학년
  grade_group_code text NOT NULL,           -- 9
  domain      text NOT NULL,                -- 듣기·말하기, 읽기, ...
  domain_code text NOT NULL,                -- 01, 02, ...
  sub_domain  text,                         -- 수학만 사용 (수, 수의 연산, ...)
  code        text NOT NULL UNIQUE,         -- 09국어01-01
  content     text NOT NULL,                -- 성취기준 본문
  explanation text NOT NULL DEFAULT '',     -- 성취기준 해설
  key_ideas   jsonb NOT NULL DEFAULT '[]',  -- 핵심 아이디어 배열
  content_elements jsonb NOT NULL DEFAULT '{}', -- 내용 체계 (4가지 형태 JSONB)
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.achievement_standards IS '2022 개정 기본교육과정 성취기준';
COMMENT ON COLUMN public.achievement_standards.sub_domain IS '수학 하위영역 (다른 과목은 NULL)';
COMMENT ON COLUMN public.achievement_standards.content_elements IS 'knowledge_understanding + process_skills + values_attitudes (JSONB)';

CREATE INDEX idx_achievement_standards_subject ON public.achievement_standards(subject);
CREATE INDEX idx_achievement_standards_code ON public.achievement_standards(code);

-- RLS: 인증된 사용자 읽기 전용
ALTER TABLE public.achievement_standards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievement_standards_select"
  ON public.achievement_standards
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- 2. teachers (교사 프로필)
-- ============================================================
CREATE TABLE public.teachers (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  name        text NOT NULL DEFAULT '',
  school      text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.teachers IS '교사 프로필 (auth.users 1:1)';

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teachers_select_own"
  ON public.teachers
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "teachers_insert_own"
  ON public.teachers
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "teachers_update_own"
  ON public.teachers
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE TRIGGER teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 3. students (학생)
-- ============================================================
CREATE TABLE public.students (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  name            text NOT NULL,
  grade           text NOT NULL DEFAULT '',     -- 중1, 중2, 중3
  disability_type text,                         -- 장애유형
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.students IS '학생 (교사별 관리)';

CREATE INDEX idx_students_teacher_id ON public.students(teacher_id);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_crud_own"
  ON public.students
  FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 4. iep_plans (IEP 계획)
-- ============================================================
CREATE TABLE public.iep_plans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id   uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  title        text NOT NULL,
  subject      text NOT NULL,                   -- 과목명
  period_start date NOT NULL,
  period_end   date NOT NULL,
  status       text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'completed')),
  goals        jsonb NOT NULL DEFAULT '[]',     -- IEP 목표 배열
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.iep_plans IS '개별화교육계획 (IEP)';

CREATE INDEX idx_iep_plans_teacher_id ON public.iep_plans(teacher_id);
CREATE INDEX idx_iep_plans_student_id ON public.iep_plans(student_id);

ALTER TABLE public.iep_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "iep_plans_crud_own"
  ON public.iep_plans
  FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE TRIGGER iep_plans_updated_at
  BEFORE UPDATE ON public.iep_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 5. weekly_plans (주간 수업 계획)
-- ============================================================
CREATE TABLE public.weekly_plans (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iep_plan_id             uuid NOT NULL REFERENCES public.iep_plans(id) ON DELETE CASCADE,
  week_number             integer NOT NULL CHECK (week_number > 0),
  achievement_standard_id uuid REFERENCES public.achievement_standards(id),
  activity                text NOT NULL DEFAULT '',
  materials               text,
  evaluation_method       text,
  notes                   text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.weekly_plans IS '주간 수업 계획 (IEP 하위)';

CREATE INDEX idx_weekly_plans_iep_plan_id ON public.weekly_plans(iep_plan_id);

ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;

-- weekly_plans는 iep_plans를 통해 teacher_id 검증
CREATE POLICY "weekly_plans_crud_own"
  ON public.weekly_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.iep_plans
      WHERE iep_plans.id = weekly_plans.iep_plan_id
        AND iep_plans.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.iep_plans
      WHERE iep_plans.id = weekly_plans.iep_plan_id
        AND iep_plans.teacher_id = auth.uid()
    )
  );

CREATE TRIGGER weekly_plans_updated_at
  BEFORE UPDATE ON public.weekly_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
