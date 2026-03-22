-- ============================================================
-- Migration: quiz_questions.chapter → MDX concept slugs
-- Date: 2026-03-22
-- Author: V (v-0322.night)
--
-- DB chapters 테이블의 테스트 데이터 slug를 로컬 MDX concept slug로 교체
-- 실행 전 반드시 백업: CREATE TABLE quiz_questions_backup AS SELECT * FROM quiz_questions;
-- ============================================================

BEGIN;

-- ─── assessment (진단평가) ───
UPDATE quiz_questions SET chapter = '평가기초와측정'       WHERE subject = 'assessment' AND chapter = 'theory';
UPDATE quiz_questions SET chapter = '표준화검사와점수'     WHERE subject = 'assessment' AND chapter = 'standardized-tests';
UPDATE quiz_questions SET chapter = '타당도신뢰도와사정'   WHERE subject = 'assessment' AND chapter = 'fba';
UPDATE quiz_questions SET chapter = 'cbm'                  WHERE subject = 'assessment' AND chapter = 'cbm';  -- 동일 (유지)
UPDATE quiz_questions SET chapter = '비공식평가와사정방법'  WHERE subject = 'assessment' AND chapter = 'strategies';
UPDATE quiz_questions SET chapter = '형성평가와진전도'     WHERE subject = 'assessment' AND chapter = 'practices';

-- ─── behavior-support (행동수정) ───
UPDATE quiz_questions SET chapter = '기본이론'              WHERE subject = 'behavior-support' AND chapter = 'aba';
UPDATE quiz_questions SET chapter = '긍정적행동지원'        WHERE subject = 'behavior-support' AND chapter = 'pbs';
UPDATE quiz_questions SET chapter = '행동감소전략'          WHERE subject = 'behavior-support' AND chapter = 'intervention';
UPDATE quiz_questions SET chapter = '관찰측정과단일대상설계' WHERE subject = 'behavior-support' AND chapter = 'assessment';
UPDATE quiz_questions SET chapter = '강화와행동증가'        WHERE subject = 'behavior-support' AND chapter = 'strategies';

-- ─── communication-disorder (의사소통장애) ───
UPDATE quiz_questions SET chapter = '말장애'                WHERE subject = 'communication-disorder' AND chapter = 'articulation';
UPDATE quiz_questions SET chapter = '중재전략과평가'        WHERE subject = 'communication-disorder' AND chapter = 'aac';
UPDATE quiz_questions SET chapter = '중재전략과평가'        WHERE subject = 'communication-disorder' AND chapter = 'spontaneous-speech';
UPDATE quiz_questions SET chapter = '언어장애'              WHERE subject = 'communication-disorder' AND chapter = 'emt';
UPDATE quiz_questions SET chapter = '말장애'                WHERE subject = 'communication-disorder' AND chapter = 'fluency';

-- ─── curriculum (교육과정) ───
UPDATE quiz_questions SET chapter = '2022개정교육과정'      WHERE subject = 'curriculum' AND chapter = 'general-curriculum';
UPDATE quiz_questions SET chapter = '교육과정재구성'        WHERE subject = 'curriculum' AND chapter = 'basic-curriculum';
UPDATE quiz_questions SET chapter = 'udl'                   WHERE subject = 'curriculum' AND chapter = 'theory';
UPDATE quiz_questions SET chapter = '전환교육과정'          WHERE subject = 'curriculum' AND chapter = 'planning';
UPDATE quiz_questions SET chapter = '교육과정재구성'        WHERE subject = 'curriculum' AND chapter = 'evaluation';
UPDATE quiz_questions SET chapter = 'iep'                   WHERE subject = 'curriculum' AND chapter = 'iep';  -- 동일 (유지)

-- ─── hearing-impairment (청각장애) ───
UPDATE quiz_questions SET chapter = '수어심화'              WHERE subject = 'hearing-impairment' AND chapter = 'sign-language';
UPDATE quiz_questions SET chapter = '보조기기'              WHERE subject = 'hearing-impairment' AND chapter = 'hearing-aid';
UPDATE quiz_questions SET chapter = '보조기기'              WHERE subject = 'hearing-impairment' AND chapter = 'cochlear-implant';
UPDATE quiz_questions SET chapter = '청력검사'              WHERE subject = 'hearing-impairment' AND chapter = 'audiogram';
UPDATE quiz_questions SET chapter = '교실환경지원'          WHERE subject = 'hearing-impairment' AND chapter = 'classroom';

-- ─── inclusive-education (통합교육) ───
UPDATE quiz_questions SET chapter = '협력교수와협동학습'    WHERE subject = 'inclusive-education' AND chapter = 'co-teaching';
UPDATE quiz_questions SET chapter = '개념과협력팀'          WHERE subject = 'inclusive-education' AND chapter = 'theory';
UPDATE quiz_questions SET chapter = '교수적합화'            WHERE subject = 'inclusive-education' AND chapter = 'strategies';
UPDATE quiz_questions SET chapter = '삽입교수와중복교육과정' WHERE subject = 'inclusive-education' AND chapter = 'practices';
UPDATE quiz_questions SET chapter = '보편적학습설계심화'    WHERE subject = 'inclusive-education' AND chapter = 'udl';

-- ─── introduction (특수교육학 개론) ───
UPDATE quiz_questions SET chapter = '특수교육역사와패러다임' WHERE subject = 'introduction' AND chapter = 'history';
UPDATE quiz_questions SET chapter = '장애유형별핵심개념'    WHERE subject = 'introduction' AND chapter = 'disability-types';
UPDATE quiz_questions SET chapter = '특수교육의정의와대상'  WHERE subject = 'introduction' AND chapter = 'understanding';

-- ─── laws (관련 법령) ───
UPDATE quiz_questions SET chapter = '특수교육법총칙과국가의무'      WHERE subject = 'laws' AND chapter = 'special-education-act';
UPDATE quiz_questions SET chapter = '특수교육대상자선정과배치'      WHERE subject = 'laws' AND chapter = 'anti-discrimination-act';
UPDATE quiz_questions SET chapter = '특수교육기관과권리구제'        WHERE subject = 'laws' AND chapter = 'welfare-act';
UPDATE quiz_questions SET chapter = '특수교육법총칙과국가의무'      WHERE subject = 'laws' AND chapter = 'theory';
UPDATE quiz_questions SET chapter = '개별화교육계획법적요건과지원'  WHERE subject = 'laws' AND chapter = 'strategies';
UPDATE quiz_questions SET chapter = '특수교육기관과권리구제'        WHERE subject = 'laws' AND chapter = 'practices';

-- ─── physical-disability (지체장애) ───
UPDATE quiz_questions SET chapter = '이해와뇌성마비'        WHERE subject = 'physical-disability' AND chapter = 'cp-types';
UPDATE quiz_questions SET chapter = '뇌성마비특성과기타유형' WHERE subject = 'physical-disability' AND chapter = 'primitive-reflexes';
UPDATE quiz_questions SET chapter = '뇌성마비특성과기타유형' WHERE subject = 'physical-disability' AND chapter = 'gmfcs';
UPDATE quiz_questions SET chapter = '자세보행일상생활'      WHERE subject = 'physical-disability' AND chapter = 'positioning';
UPDATE quiz_questions SET chapter = '건강장애와병원학교'    WHERE subject = 'physical-disability' AND chapter = 'muscular-dystrophy';

-- ─── transition (전환교육) ───
UPDATE quiz_questions SET chapter = '전환교육개요'          WHERE subject = 'transition' AND chapter = 'planning';
UPDATE quiz_questions SET chapter = '전환결과고용'          WHERE subject = 'transition' AND chapter = 'cbi';
UPDATE quiz_questions SET chapter = '전환교육개요'          WHERE subject = 'transition' AND chapter = 'self-determination';
UPDATE quiz_questions SET chapter = '전환교육개요'          WHERE subject = 'transition' AND chapter = 'theory';
UPDATE quiz_questions SET chapter = '전환평가'              WHERE subject = 'transition' AND chapter = 'strategies';
UPDATE quiz_questions SET chapter = '전환결과고용'          WHERE subject = 'transition' AND chapter = 'practices';

-- ─── visual-impairment (시각장애) ───
UPDATE quiz_questions SET chapter = '촉각청각점자'          WHERE subject = 'visual-impairment' AND chapter = 'braille';
UPDATE quiz_questions SET chapter = '보행기술'              WHERE subject = 'visual-impairment' AND chapter = 'orientation-mobility';
UPDATE quiz_questions SET chapter = '검사와보행훈련'        WHERE subject = 'visual-impairment' AND chapter = 'visual-acuity';
UPDATE quiz_questions SET chapter = '교육과정'              WHERE subject = 'visual-impairment' AND chapter = 'visual-training';
UPDATE quiz_questions SET chapter = '보조공학'              WHERE subject = 'visual-impairment' AND chapter = 'assistive-tech';

COMMIT;

-- ============================================================
-- 검증 쿼리: 영어 slug가 남아있는지 확인
-- ============================================================
-- SELECT DISTINCT subject, chapter FROM quiz_questions
-- WHERE chapter ~ '^[a-z]'
-- ORDER BY subject, chapter;
