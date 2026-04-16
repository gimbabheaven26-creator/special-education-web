-- M2 Phase 3: "나도 틀렸어요" 공감 카운터 + 학습 랭킹 옵트인
-- 실행: Supabase SQL Editor (카이란)

-- ─── 1. wrong_note_stats: 오답 익명 집계 ───

CREATE TABLE IF NOT EXISTS wrong_note_stats (
  question_id text PRIMARY KEY,
  wrong_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: 읽기 공개, 쓰기 service role only
ALTER TABLE wrong_note_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wrong_note_stats_read_all"
  ON wrong_note_stats FOR SELECT
  USING (true);

-- service role은 RLS bypass하므로 별도 INSERT/UPDATE 정책 불필요

-- ─── 2. profiles: 랭킹 옵트인 컬럼 ───

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS show_in_ranking boolean NOT NULL DEFAULT false;

-- 랭킹 조회용: show_in_ranking=true인 프로필은 전체 읽기 허용
-- 기존 RLS "본인만 읽기" 정책과 OR 결합됨 (PostgreSQL 기본)
CREATE POLICY "profiles_ranking_read"
  ON profiles FOR SELECT
  USING (show_in_ranking = true);

-- ─── 3. 랭킹 조회 RPC ───

CREATE OR REPLACE FUNCTION get_weekly_ranking(limit_count integer DEFAULT 20)
RETURNS TABLE (
  user_id uuid,
  nickname text,
  total_xp integer,
  current_streak integer,
  longest_streak integer
) AS $$
  SELECT
    p.id AS user_id,
    COALESCE(NULLIF(p.nickname, ''), NULLIF(p.display_name, ''), '익명') AS nickname,
    COALESCE((ud.data->>'totalXP')::integer, 0) AS total_xp,
    COALESCE((ud.data->>'currentStreak')::integer, 0) AS current_streak,
    COALESCE((ud.data->>'longestStreak')::integer, 0) AS longest_streak
  FROM profiles p
  LEFT JOIN user_data ud ON ud.user_id = p.id AND ud.store_key = 'study'
  WHERE p.show_in_ranking = true
  ORDER BY total_xp DESC
  LIMIT limit_count;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
