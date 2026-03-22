/**
 * Data Validator (그린/GREEN)
 * Read-only validation script — no data modifications.
 * Validates all Supabase tables against docs/contract.md rules.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── helpers ──────────────────────────────────────────────────────────────────

function pass(label, detail = '') {
  console.log(`  [PASS] ${label}${detail ? ' — ' + detail : ''}`);
}

function fail(label, detail = '') {
  console.log(`  [FAIL] ${label}${detail ? ' — ' + detail : ''}`);
}

function section(title) {
  console.log(`\n### ${title}`);
}

// ── fetch all data (with pagination to bypass 1000-row default limit) ─────────

async function fetchPaginated(table, columns = '*') {
  const PAGE_SIZE = 1000;
  let rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`${table} fetch error: ${error.message}`);
    if (!data || data.length === 0) break;
    rows = rows.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

async function fetchAll() {
  const [subjects, chapters, quizzes, wsTopics, wsQuestions, reviews, community, votes] =
    await Promise.all([
      fetchPaginated('subjects'),
      fetchPaginated('chapters'),
      fetchPaginated('quiz_questions'),
      fetchPaginated('worksheet_topics'),
      fetchPaginated('worksheet_questions'),
      fetchPaginated('reviews'),
      fetchPaginated('community_questions'),
      fetchPaginated('question_votes'),
    ]);

  return { subjects, chapters, quizzes, wsTopics, wsQuestions, reviews, community, votes };
}

// ── validations ───────────────────────────────────────────────────────────────

function check1_referentialIntegrity({ subjects, chapters, quizzes, wsTopics, wsQuestions }) {
  section('1. Referential Integrity');
  let totalViolations = 0;

  const subjectSlugs = new Set(subjects.map(s => s.slug));

  // 1-1. chapters.subject_slug → subjects.slug
  const badChapters = chapters.filter(c => !subjectSlugs.has(c.subject_slug));
  if (badChapters.length === 0) {
    pass('chapters.subject_slug → subjects.slug', '0 violations');
  } else {
    fail(`chapters.subject_slug → subjects.slug`, `${badChapters.length} violations`);
    badChapters.forEach(c =>
      console.log(`     chapter id=${c.id} slug="${c.slug}" references non-existent subject "${c.subject_slug}"`)
    );
    totalViolations += badChapters.length;
  }

  // 1-2. quiz_questions.subject → subjects.slug
  const badQuizSubject = quizzes.filter(q => !subjectSlugs.has(q.subject));
  if (badQuizSubject.length === 0) {
    pass('quiz_questions.subject → subjects.slug', '0 violations');
  } else {
    fail(`quiz_questions.subject → subjects.slug`, `${badQuizSubject.length} violations`);
    badQuizSubject.slice(0, 10).forEach(q =>
      console.log(`     quiz id="${q.id}" references non-existent subject "${q.subject}"`)
    );
    if (badQuizSubject.length > 10) console.log(`     ... and ${badQuizSubject.length - 10} more`);
    totalViolations += badQuizSubject.length;
  }

  // 1-3. quiz_questions.chapter → chapters.slug (within same subject)
  // Build map: subject → Set<chapter_slug>
  const chaptersBySubject = {};
  for (const c of chapters) {
    if (!chaptersBySubject[c.subject_slug]) chaptersBySubject[c.subject_slug] = new Set();
    chaptersBySubject[c.subject_slug].add(c.slug);
  }
  // Also build a global set of all chapter slugs for cross-subject check
  const allChapterSlugs = new Set(chapters.map(c => c.slug));

  const badQuizChapter = quizzes.filter(q => {
    const subjectChapters = chaptersBySubject[q.subject];
    if (!subjectChapters) return true; // subject itself is invalid (already caught above)
    return !subjectChapters.has(q.chapter);
  });
  if (badQuizChapter.length === 0) {
    pass('quiz_questions.chapter → chapters.slug (same subject)', '0 violations');
  } else {
    fail(`quiz_questions.chapter → chapters.slug`, `${badQuizChapter.length} violations`);
    // Show top 20 unique chapter slugs causing issues
    const uniqueBadChapters = [...new Set(badQuizChapter.map(q => `${q.subject}::${q.chapter}`))];
    uniqueBadChapters.slice(0, 20).forEach(key =>
      console.log(`     subject::chapter "${key}"`)
    );
    if (uniqueBadChapters.length > 20) console.log(`     ... and ${uniqueBadChapters.length - 20} more unique pairs`);
    console.log(`     Total affected quizzes: ${badQuizChapter.length}`);
    totalViolations += badQuizChapter.length;
  }

  // 1-4. worksheet_questions.subject → subjects.slug
  const badWsSubject = wsQuestions.filter(w => !subjectSlugs.has(w.subject));
  if (badWsSubject.length === 0) {
    pass('worksheet_questions.subject → subjects.slug', '0 violations');
  } else {
    fail(`worksheet_questions.subject → subjects.slug`, `${badWsSubject.length} violations`);
    badWsSubject.slice(0, 5).forEach(w =>
      console.log(`     ws id="${w.id}" references non-existent subject "${w.subject}"`)
    );
    totalViolations += badWsSubject.length;
  }

  // 1-5. worksheet_questions.topic_id → worksheet_topics.id
  const topicIds = new Set(wsTopics.map(t => t.id));
  const badWsTopic = wsQuestions.filter(w => !topicIds.has(w.topic_id));
  if (badWsTopic.length === 0) {
    pass('worksheet_questions.topic_id → worksheet_topics.id', '0 violations');
  } else {
    fail(`worksheet_questions.topic_id → worksheet_topics.id`, `${badWsTopic.length} violations`);
    badWsTopic.slice(0, 5).forEach(w =>
      console.log(`     ws id="${w.id}" references non-existent topic "${w.topic_id}"`)
    );
    totalViolations += badWsTopic.length;
  }

  // 1-6. worksheet_topics.subject → subjects.slug
  const badWsTopicSubject = wsTopics.filter(t => !subjectSlugs.has(t.subject));
  if (badWsTopicSubject.length === 0) {
    pass('worksheet_topics.subject → subjects.slug', '0 violations');
  } else {
    fail(`worksheet_topics.subject → subjects.slug`, `${badWsTopicSubject.length} violations`);
    badWsTopicSubject.forEach(t =>
      console.log(`     topic id="${t.id}" references non-existent subject "${t.subject}"`)
    );
    totalViolations += badWsTopicSubject.length;
  }

  // 1-7. community_questions.subject_id → subjects.slug (if any exist)
  return totalViolations;
}

function check2_idNaming({ quizzes, wsTopics, wsQuestions }) {
  section('2. ID Naming Conventions');
  let totalViolations = 0;

  // Contract v2 ID patterns per subject
  const prefixMap = {
    'introduction': 'intro-',
    'behavior-support': 'bs-',
    'curriculum': 'cur-',
    'inclusive-education': 'inc-',
    'assessment': 'asmnt-',
    'transition': 'trans-',
    'laws': 'laws-',
    'visual-impairment': 'vi-',
    'hearing-impairment': 'hi-',
    'physical-disability': 'pd-',
    'communication-disorder': 'cd-',
  };

  // quiz_questions: {prefix}q{n}
  const quizIdViolations = [];
  for (const q of quizzes) {
    const expectedPrefix = prefixMap[q.subject];
    if (!expectedPrefix) continue; // unknown subject — caught elsewhere
    // Pattern: {prefix}q{digits}
    const pattern = new RegExp(`^${expectedPrefix.replace('-', '\\-')}q\\d+$`);
    if (!pattern.test(q.id)) {
      quizIdViolations.push(q.id);
    }
  }
  if (quizIdViolations.length === 0) {
    pass('quiz_questions IDs follow {prefix}q{n}', '0 violations');
  } else {
    fail(`quiz_questions IDs follow {prefix}q{n}`, `${quizIdViolations.length} violations`);
    // Group by pattern type
    const kicePattern = quizIdViolations.filter(id => id.startsWith('kice-'));
    const termPattern = quizIdViolations.filter(id => id.startsWith('term-'));
    const introPattern = quizIdViolations.filter(id => id.includes('-ox-') || id.includes('-q-'));
    const other = quizIdViolations.filter(id =>
      !id.startsWith('kice-') && !id.startsWith('term-') && !id.includes('-ox-') && !id.includes('-q-')
    );
    console.log(`     kice-* pattern: ${kicePattern.length} IDs`);
    console.log(`     term-* pattern: ${termPattern.length} IDs`);
    console.log(`     *-ox-* or *-q-* pattern: ${introPattern.length} IDs`);
    console.log(`     other legacy: ${other.length} IDs`);
    if (other.length > 0) {
      console.log(`     Other samples: ${other.slice(0, 10).join(', ')}`);
    }
    totalViolations += quizIdViolations.length;
  }

  // worksheet_topics: {prefix}topic-{n}
  const wsTopicViolations = wsTopics.filter(t => {
    const expectedPrefix = prefixMap[t.subject];
    if (!expectedPrefix) return false;
    const pattern = new RegExp(`^${expectedPrefix.replace('-', '\\-')}topic-\\d+$`);
    return !pattern.test(t.id);
  });
  if (wsTopicViolations.length === 0) {
    pass('worksheet_topics IDs follow {prefix}topic-{n}', '0 violations');
  } else {
    fail(`worksheet_topics IDs follow {prefix}topic-{n}`, `${wsTopicViolations.length} violations`);
    wsTopicViolations.slice(0, 10).forEach(t =>
      console.log(`     id="${t.id}" subject="${t.subject}"`)
    );
    totalViolations += wsTopicViolations.length;
  }

  // worksheet_questions: {prefix}ws-{nn}
  const wsQViolations = wsQuestions.filter(w => {
    const expectedPrefix = prefixMap[w.subject];
    if (!expectedPrefix) return false;
    const pattern = new RegExp(`^${expectedPrefix.replace('-', '\\-')}ws-\\d+$`);
    return !pattern.test(w.id);
  });
  if (wsQViolations.length === 0) {
    pass('worksheet_questions IDs follow {prefix}ws-{nn}', '0 violations');
  } else {
    fail(`worksheet_questions IDs follow {prefix}ws-{nn}`, `${wsQViolations.length} violations`);
    wsQViolations.slice(0, 5).forEach(w =>
      console.log(`     id="${w.id}" subject="${w.subject}"`)
    );
    if (wsQViolations.length > 5) console.log(`     ... and ${wsQViolations.length - 5} more`);
    totalViolations += wsQViolations.length;
  }

  return totalViolations;
}

function check3_valueConstraints({ quizzes, wsQuestions, reviews, community, votes }) {
  section('3. Value Constraints');
  let totalViolations = 0;

  const validQuizTypes = new Set(['multiple', 'ox', 'fill_in', 'descriptive']);
  const validWsTypes = new Set(['fill_in', 'descriptive']);
  const validDifficulties = new Set([1, 2, 3]);
  const validAnswerMultiple = new Set(['0', '1', '2', '3']);
  const validAnswerOx = new Set(['O', 'X']);

  // 3-1. Quiz type
  const badQuizType = quizzes.filter(q => !validQuizTypes.has(q.type));
  if (badQuizType.length === 0) {
    pass('quiz_questions.type is valid', '0 violations');
  } else {
    fail(`quiz_questions.type is valid`, `${badQuizType.length} violations`);
    badQuizType.forEach(q => console.log(`     id="${q.id}" type="${q.type}"`));
    totalViolations += badQuizType.length;
  }

  // 3-2. Quiz difficulty
  const badQuizDiff = quizzes.filter(q => !validDifficulties.has(q.difficulty));
  if (badQuizDiff.length === 0) {
    pass('quiz_questions.difficulty is 1|2|3', '0 violations');
  } else {
    fail(`quiz_questions.difficulty is 1|2|3`, `${badQuizDiff.length} violations`);
    badQuizDiff.forEach(q => console.log(`     id="${q.id}" difficulty=${q.difficulty}`));
    totalViolations += badQuizDiff.length;
  }

  // 3-3. Multiple answer format ("0"~"3")
  const multipleQuizzes = quizzes.filter(q => q.type === 'multiple');
  const badMultipleAnswer = multipleQuizzes.filter(q => !validAnswerMultiple.has(q.answer));
  if (badMultipleAnswer.length === 0) {
    pass('multiple quiz answer is "0"~"3"', '0 violations');
  } else {
    fail(`multiple quiz answer is "0"~"3"`, `${badMultipleAnswer.length} violations`);
    badMultipleAnswer.slice(0, 20).forEach(q =>
      console.log(`     id="${q.id}" answer="${q.answer}"`)
    );
    if (badMultipleAnswer.length > 20) console.log(`     ... and ${badMultipleAnswer.length - 20} more`);
    totalViolations += badMultipleAnswer.length;
  }

  // 3-4. OX answer format ("O" or "X")
  const oxQuizzes = quizzes.filter(q => q.type === 'ox');
  const badOxAnswer = oxQuizzes.filter(q => !validAnswerOx.has(q.answer));
  if (badOxAnswer.length === 0) {
    pass('ox quiz answer is "O"|"X"', '0 violations');
  } else {
    fail(`ox quiz answer is "O"|"X"`, `${badOxAnswer.length} violations`);
    badOxAnswer.slice(0, 10).forEach(q =>
      console.log(`     id="${q.id}" answer="${q.answer}"`)
    );
    totalViolations += badOxAnswer.length;
  }

  // 3-5. Multiple options: exactly 4 elements
  const badOptions = multipleQuizzes.filter(q => {
    if (!q.options || !Array.isArray(q.options)) return true;
    return q.options.length !== 4;
  });
  if (badOptions.length === 0) {
    pass('multiple quiz options has exactly 4 elements', '0 violations');
  } else {
    fail(`multiple quiz options has exactly 4 elements`, `${badOptions.length} violations`);
    badOptions.slice(0, 10).forEach(q =>
      console.log(`     id="${q.id}" options.length=${q.options ? q.options.length : 'null'}`)
    );
    if (badOptions.length > 10) console.log(`     ... and ${badOptions.length - 10} more`);
    totalViolations += badOptions.length;
  }

  // 3-6. wrong_explanations key range (must be "0"~"3" only, no "4"+)
  const validWeKeys = new Set(['0', '1', '2', '3']);
  const badWrongExpKeys = quizzes.filter(q => {
    if (!q.wrong_explanations) return false;
    const keys = Object.keys(q.wrong_explanations);
    return keys.some(k => !validWeKeys.has(k));
  });
  if (badWrongExpKeys.length === 0) {
    pass('wrong_explanations keys are "0"~"3" only', '0 violations');
  } else {
    fail(`wrong_explanations keys are "0"~"3" only`, `${badWrongExpKeys.length} violations`);
    badWrongExpKeys.slice(0, 20).forEach(q => {
      const badKeys = Object.keys(q.wrong_explanations).filter(k => !validWeKeys.has(k));
      console.log(`     id="${q.id}" invalid keys: [${badKeys.join(', ')}]`);
    });
    if (badWrongExpKeys.length > 20) console.log(`     ... and ${badWrongExpKeys.length - 20} more`);
    totalViolations += badWrongExpKeys.length;
  }

  // 3-7. wrong_explanations should NOT contain the correct answer key
  const weHasAnswerKey = quizzes.filter(q => {
    if (!q.wrong_explanations || q.type !== 'multiple') return false;
    if (!validAnswerMultiple.has(q.answer)) return false; // answer itself is invalid
    return Object.keys(q.wrong_explanations).includes(q.answer);
  });
  if (weHasAnswerKey.length === 0) {
    pass('wrong_explanations does not include correct answer key', '0 violations');
  } else {
    fail(`wrong_explanations includes correct answer key`, `${weHasAnswerKey.length} violations`);
    weHasAnswerKey.slice(0, 10).forEach(q =>
      console.log(`     id="${q.id}" answer="${q.answer}" but WE has key="${q.answer}"`)
    );
    totalViolations += weHasAnswerKey.length;
  }

  // 3-8. Worksheet type
  const badWsType = wsQuestions.filter(w => !validWsTypes.has(w.type));
  if (badWsType.length === 0) {
    pass('worksheet_questions.type is fill_in|descriptive', '0 violations');
  } else {
    fail(`worksheet_questions.type is fill_in|descriptive`, `${badWsType.length} violations`);
    badWsType.forEach(w => console.log(`     id="${w.id}" type="${w.type}"`));
    totalViolations += badWsType.length;
  }

  // 3-9. Worksheet difficulty
  const badWsDiff = wsQuestions.filter(w => !validDifficulties.has(w.difficulty));
  if (badWsDiff.length === 0) {
    pass('worksheet_questions.difficulty is 1|2|3', '0 violations');
  } else {
    fail(`worksheet_questions.difficulty is 1|2|3`, `${badWsDiff.length} violations`);
    badWsDiff.forEach(w => console.log(`     id="${w.id}" difficulty=${w.difficulty}`));
    totalViolations += badWsDiff.length;
  }

  // 3-10. reviews.status
  const validReviewStatus = new Set(['pending', 'discussing', 'accepted', 'rejected']);
  const badReviewStatus = reviews.filter(r => !validReviewStatus.has(r.status));
  if (badReviewStatus.length === 0) {
    pass('reviews.status is valid', '0 violations');
  } else {
    fail(`reviews.status is valid`, `${badReviewStatus.length} violations`);
    badReviewStatus.forEach(r => console.log(`     id=${r.id} status="${r.status}"`));
    totalViolations += badReviewStatus.length;
  }

  // 3-11. community_questions.question_type
  const validCommunityTypes = new Set(['multiple', 'ox', 'fill_in', 'descriptive']);
  const badCommunityType = community.filter(c => !validCommunityTypes.has(c.question_type));
  if (badCommunityType.length === 0) {
    pass('community_questions.question_type is valid', `0 violations (${community.length} rows)`);
  } else {
    fail(`community_questions.question_type is valid`, `${badCommunityType.length} violations`);
    badCommunityType.forEach(c => console.log(`     id="${c.id}" type="${c.question_type}"`));
    totalViolations += badCommunityType.length;
  }

  // 3-12. community_questions.status
  const validCommunityStatus = new Set(['pending', 'official']);
  const badCommunityStatus = community.filter(c => !validCommunityStatus.has(c.status));
  if (badCommunityStatus.length === 0) {
    pass('community_questions.status is pending|official', `0 violations`);
  } else {
    fail(`community_questions.status is pending|official`, `${badCommunityStatus.length} violations`);
    badCommunityStatus.forEach(c => console.log(`     id="${c.id}" status="${c.status}"`));
    totalViolations += badCommunityStatus.length;
  }

  // 3-13. question_votes.vote_type
  const validVoteTypes = new Set(['up', 'down']);
  const badVoteType = votes.filter(v => !validVoteTypes.has(v.vote_type));
  if (badVoteType.length === 0) {
    pass('question_votes.vote_type is up|down', `0 violations (${votes.length} rows)`);
  } else {
    fail(`question_votes.vote_type is up|down`, `${badVoteType.length} violations`);
    badVoteType.forEach(v => console.log(`     id="${v.id}" vote_type="${v.vote_type}"`));
    totalViolations += badVoteType.length;
  }

  return totalViolations;
}

function check4_completeness({ subjects, chapters, quizzes, wsTopics, wsQuestions }) {
  section('4. Data Completeness');
  let totalViolations = 0;

  // 4-1. No NULL in NOT NULL columns — quiz_questions
  const requiredQuizCols = ['subject', 'chapter', 'type', 'question', 'answer', 'explanation', 'difficulty'];
  for (const col of requiredQuizCols) {
    const nullRows = quizzes.filter(q => q[col] === null || q[col] === undefined);
    if (nullRows.length === 0) {
      pass(`quiz_questions.${col} NOT NULL`, '0 violations');
    } else {
      fail(`quiz_questions.${col} NOT NULL`, `${nullRows.length} violations`);
      nullRows.slice(0, 5).forEach(q => console.log(`     id="${q.id}"`));
      totalViolations += nullRows.length;
    }
  }

  // 4-2. No NULL in NOT NULL columns — worksheet_questions
  const requiredWsCols = ['topic_id', 'subject', 'type', 'difficulty', 'question', 'answer', 'explanation'];
  for (const col of requiredWsCols) {
    const nullRows = wsQuestions.filter(w => w[col] === null || w[col] === undefined);
    if (nullRows.length === 0) {
      pass(`worksheet_questions.${col} NOT NULL`, '0 violations');
    } else {
      fail(`worksheet_questions.${col} NOT NULL`, `${nullRows.length} violations`);
      nullRows.slice(0, 5).forEach(w => console.log(`     id="${w.id}"`));
      totalViolations += nullRows.length;
    }
  }

  // 4-3. Multiple-choice must have options
  const multipleNoOptions = quizzes.filter(q =>
    q.type === 'multiple' && (!q.options || !Array.isArray(q.options) || q.options.length === 0)
  );
  if (multipleNoOptions.length === 0) {
    pass('All multiple-choice quizzes have options', '0 violations');
  } else {
    fail(`Multiple-choice quizzes missing options`, `${multipleNoOptions.length} violations`);
    multipleNoOptions.slice(0, 10).forEach(q => console.log(`     id="${q.id}"`));
    totalViolations += multipleNoOptions.length;
  }

  // 4-4. Every subject has at least 1 chapter
  const subjectSlugSet = new Set(subjects.map(s => s.slug));
  const chapterSubjectSet = new Set(chapters.map(c => c.subject_slug));
  const subjectsWithoutChapters = [...subjectSlugSet].filter(s => !chapterSubjectSet.has(s));
  if (subjectsWithoutChapters.length === 0) {
    pass('Every subject has at least 1 chapter', '0 violations');
  } else {
    fail(`Subjects without chapters`, `${subjectsWithoutChapters.length} violations`);
    subjectsWithoutChapters.forEach(s => console.log(`     subject="${s}"`));
    totalViolations += subjectsWithoutChapters.length;
  }

  // 4-5. Every chapter should have at least 1 quiz
  const quizChapterMap = {};
  for (const q of quizzes) {
    const key = `${q.subject}::${q.chapter}`;
    quizChapterMap[key] = (quizChapterMap[key] || 0) + 1;
  }
  const chaptersWithoutQuiz = chapters.filter(c => {
    const key = `${c.subject_slug}::${c.slug}`;
    return !quizChapterMap[key];
  });
  if (chaptersWithoutQuiz.length === 0) {
    pass('Every chapter has at least 1 quiz', '0 violations');
  } else {
    fail(`Chapters without quizzes`, `${chaptersWithoutQuiz.length} violations`);
    chaptersWithoutQuiz.forEach(c =>
      console.log(`     chapter id=${c.id} subject="${c.subject_slug}" slug="${c.slug}"`)
    );
    totalViolations += chaptersWithoutQuiz.length;
  }

  // 4-6. subjects NOT NULL columns
  const requiredSubjectCols = ['title', 'description', 'icon', 'color', 'sort_order'];
  for (const col of requiredSubjectCols) {
    const nullRows = subjects.filter(s => s[col] === null || s[col] === undefined);
    if (nullRows.length === 0) {
      pass(`subjects.${col} NOT NULL`, '0 violations');
    } else {
      fail(`subjects.${col} NOT NULL`, `${nullRows.length} violations`);
      nullRows.forEach(s => console.log(`     slug="${s.slug}"`));
      totalViolations += nullRows.length;
    }
  }

  return totalViolations;
}

function check5_distribution({ subjects, quizzes, wsQuestions }) {
  section('5. Distribution Analysis');

  const subjectList = subjects.map(s => s.slug);

  console.log('\n  Quiz distribution per subject:');
  console.log('  ' + ['Subject', 'Total', 'multiple', 'ox', 'fill_in', 'desc', 'diff1', 'diff2', 'diff3', 'diffAvg'].map(h => h.padEnd(18)).join(''));
  console.log('  ' + '-'.repeat(180));

  let warnings = 0;

  for (const subject of subjectList) {
    const subjectQuizzes = quizzes.filter(q => q.subject === subject);
    const total = subjectQuizzes.length;
    if (total === 0) {
      console.log(`  ${subject.padEnd(28)} NO QUIZZES`);
      warnings++;
      continue;
    }
    const byType = {
      multiple: subjectQuizzes.filter(q => q.type === 'multiple').length,
      ox: subjectQuizzes.filter(q => q.type === 'ox').length,
      fill_in: subjectQuizzes.filter(q => q.type === 'fill_in').length,
      descriptive: subjectQuizzes.filter(q => q.type === 'descriptive').length,
    };
    const byDiff = {
      1: subjectQuizzes.filter(q => q.difficulty === 1).length,
      2: subjectQuizzes.filter(q => q.difficulty === 2).length,
      3: subjectQuizzes.filter(q => q.difficulty === 3).length,
    };
    const diffAvg = (subjectQuizzes.reduce((sum, q) => sum + (q.difficulty || 0), 0) / total).toFixed(2);

    // Flag 100% single difficulty
    const maxDiffPct = Math.max(...Object.values(byDiff)) / total;
    const diffWarn = maxDiffPct === 1.0 ? ' *** 100% SINGLE DIFF ***' : '';

    console.log(`  ${subject.padEnd(28)} ${String(total).padEnd(8)} ${String(byType.multiple).padEnd(10)} ${String(byType.ox).padEnd(8)} ${String(byType.fill_in).padEnd(10)} ${String(byType.descriptive).padEnd(10)} ${String(byDiff[1]).padEnd(8)} ${String(byDiff[2]).padEnd(8)} ${String(byDiff[3]).padEnd(8)} ${diffAvg}${diffWarn}`);

    if (maxDiffPct === 1.0) warnings++;
  }

  console.log('\n  Worksheet distribution per subject:');
  console.log('  ' + ['Subject', 'Total', 'fill_in', 'descriptive', 'diff1', 'diff2', 'diff3'].map(h => h.padEnd(18)).join(''));
  console.log('  ' + '-'.repeat(108));

  for (const subject of subjectList) {
    const subjectWs = wsQuestions.filter(w => w.subject === subject);
    const total = subjectWs.length;
    if (total === 0) {
      console.log(`  ${subject.padEnd(28)} NO WORKSHEETS`);
      continue;
    }
    const byType = {
      fill_in: subjectWs.filter(w => w.type === 'fill_in').length,
      descriptive: subjectWs.filter(w => w.type === 'descriptive').length,
    };
    const byDiff = {
      1: subjectWs.filter(w => w.difficulty === 1).length,
      2: subjectWs.filter(w => w.difficulty === 2).length,
      3: subjectWs.filter(w => w.difficulty === 3).length,
    };
    console.log(`  ${subject.padEnd(28)} ${String(total).padEnd(8)} ${String(byType.fill_in).padEnd(12)} ${String(byType.descriptive).padEnd(14)} ${String(byDiff[1]).padEnd(8)} ${String(byDiff[2]).padEnd(8)} ${String(byDiff[3])}`);
  }

  return warnings;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  console.log('\n## Data Validation Report');
  console.log(`\n**Date:** ${today}`);
  console.log('**Tables Checked:** subjects, chapters, quiz_questions, worksheet_topics, worksheet_questions, reviews, community_questions, question_votes');

  console.log('\nFetching all data from Supabase...');
  const data = await fetchAll();

  console.log(`\nRow counts:`);
  console.log(`  subjects:             ${data.subjects.length}`);
  console.log(`  chapters:             ${data.chapters.length}`);
  console.log(`  quiz_questions:       ${data.quizzes.length}`);
  console.log(`  worksheet_topics:     ${data.wsTopics.length}`);
  console.log(`  worksheet_questions:  ${data.wsQuestions.length}`);
  console.log(`  reviews:              ${data.reviews.length}`);
  console.log(`  community_questions:  ${data.community.length}`);
  console.log(`  question_votes:       ${data.votes.length}`);

  const v1 = check1_referentialIntegrity(data);
  const v2 = check2_idNaming(data);
  const v3 = check3_valueConstraints(data);
  const v4 = check4_completeness(data);
  const warnings = check5_distribution(data);

  const totalViolations = v1 + v2 + v3 + v4;

  console.log('\n---');
  console.log(`\n**Total Violations:** ${totalViolations}`);
  console.log(`  Referential Integrity: ${v1}`);
  console.log(`  ID Naming:             ${v2}`);
  console.log(`  Value Constraints:     ${v3}`);
  console.log(`  Data Completeness:     ${v4}`);
  console.log(`  Distribution Warnings: ${warnings}`);

  console.log('\n### Recommendation');
  if (totalViolations === 0) {
    console.log('  CLEAN — All checks passed. No action required.');
  } else {
    console.log('  HAS_ISSUES — Actions needed:');
    if (v1 > 0) console.log(`    - Fix ${v1} referential integrity violations`);
    if (v2 > 0) console.log(`    - Fix ${v2} ID naming violations (see contract.md v2 "정리 필요")`);
    if (v3 > 0) console.log(`    - Fix ${v3} value constraint violations`);
    if (v4 > 0) console.log(`    - Fix ${v4} data completeness violations`);
    if (warnings > 0) console.log(`    - Review ${warnings} distribution warnings`);
  }
}

main().catch(err => {
  console.error('Validation script error:', err);
  process.exit(1);
});
