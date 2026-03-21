-- profiles 확장 마이그레이션
-- 2026-03-22
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/ssluhxvbyzqmdkbjwoke/editor

-- 1. profiles 에 누락된 컬럼 추가
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email       text,
  ADD COLUMN IF NOT EXISTS avatar_url  text,
  ADD COLUMN IF NOT EXISTS exam_date   date;

-- 2. user_data store_key 제약 조건에 'onboarding' 추가
--    기존 check constraint 교체
ALTER TABLE public.user_data
  DROP CONSTRAINT IF EXISTS user_data_store_key_check;

ALTER TABLE public.user_data
  ADD CONSTRAINT user_data_store_key_check
    CHECK (store_key IN ('study', 'leitner', 'quiz', 'bookmark', 'onboarding'));

-- 3. profiles — 신규 유저 트리거에서 email 자동 저장
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

-- 4. question_reports 테이블 생성 (커뮤니티 신고)
CREATE TABLE IF NOT EXISTS public.question_reports (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.community_questions(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason      TEXT NOT NULL DEFAULT '신고',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.question_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "신고 삽입" ON public.question_reports
  FOR INSERT TO authenticated WITH CHECK (true);
