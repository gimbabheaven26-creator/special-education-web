-- FK Constraints Migration
-- Run in Supabase SQL Editor or via: psql $DATABASE_URL < scripts/add-fk-constraints.sql
-- Prerequisites: All referential integrity violations must be resolved first.
-- Verify: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/validate-data.mjs

-- FK 1: chapters.subject_slug → subjects.slug
ALTER TABLE chapters
  ADD CONSTRAINT fk_chapters_subject
  FOREIGN KEY (subject_slug) REFERENCES subjects(slug)
  ON DELETE CASCADE;

-- FK 2: quiz_questions.subject → subjects.slug
ALTER TABLE quiz_questions
  ADD CONSTRAINT fk_quiz_questions_subject
  FOREIGN KEY (subject) REFERENCES subjects(slug)
  ON DELETE CASCADE;

-- FK 3: worksheet_topics.subject → subjects.slug
ALTER TABLE worksheet_topics
  ADD CONSTRAINT fk_worksheet_topics_subject
  FOREIGN KEY (subject) REFERENCES subjects(slug)
  ON DELETE CASCADE;

-- FK 4: worksheet_questions.topic_id → worksheet_topics.id
ALTER TABLE worksheet_questions
  ADD CONSTRAINT fk_worksheet_questions_topic
  FOREIGN KEY (topic_id) REFERENCES worksheet_topics(id)
  ON DELETE CASCADE;

-- FK 5: worksheet_questions.subject → subjects.slug
ALTER TABLE worksheet_questions
  ADD CONSTRAINT fk_worksheet_questions_subject
  FOREIGN KEY (subject) REFERENCES subjects(slug)
  ON DELETE CASCADE;

-- Verify: list all FK constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;
