// =============================================================================
// KICE 중등특수교사 임용고시 PDF 파싱 스크립트
// =============================================================================
//
// Usage: npx tsx scripts/parse-kice-pdf.ts <path-to-pdf> [--year 2026] [--session 2]
// Output: scripts/output/kice-{year}-{session}.json
//
// 시험 구조:
//   1교시 - 교육학 (논술형 1문항, 20점)
//   2교시 - 전공A (기입형 4문항 각 2점 + 서술형 4문항 각 4점)
//   3교시 - 전공B (기입형 2문항 각 2점 + 서술형 4문항 각 4~5점)
//
// 파싱 로직 개요:
//   1. pdf-parse로 PDF 텍스트 추출
//   2. 교시 구분자로 텍스트를 섹션으로 분리
//   3. 각 섹션에서 문항 번호 패턴으로 문항 분리
//   4. 배점 정보로 문항 유형(기입형/서술형/논술형) 판별
//   5. 사례(괄호/조건) 블록 추출
//   6. QuizQuestion[] 형식으로 직렬화하여 JSON 출력
// =============================================================================

import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (dataBuffer: Buffer) => Promise<{ text: string; numpages: number; info: Record<string, unknown> }>;

// ---------------------------------------------------------------------------
// 타입 정의 (quiz.ts의 QuizQuestion과 동일한 구조)
// ---------------------------------------------------------------------------

type QuizType = 'multiple' | 'ox' | 'fill_in' | 'descriptive';

interface QuizQuestion {
  id: string;
  subject: string;
  chapter: string;
  type: QuizType;
  question: string;
  caseContext?: string;
  options?: string[];
  answer: string | number;
  explanation: string;
  wrongExplanations?: Record<string, string>;
  difficulty: 1 | 2 | 3;
  source?: string;
  tags?: {
    disability?: string;
    year?: number;
    round?: number;
  };
}

// ---------------------------------------------------------------------------
// CLI 인자 파싱
// ---------------------------------------------------------------------------

function parseArgs(): { pdfPath: string; year: number; session: number } {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('사용법: npx tsx scripts/parse-kice-pdf.ts <pdf-path> [--year 2026] [--session 2]');
    process.exit(1);
  }

  const pdfPath = args[0];
  let year = new Date().getFullYear();
  let session = 2; // 기본값: 2교시 전공A

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--year' && args[i + 1]) {
      year = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--session' && args[i + 1]) {
      session = parseInt(args[i + 1], 10);
      i++;
    }
  }

  if (!fs.existsSync(pdfPath)) {
    console.error(`파일을 찾을 수 없습니다: ${pdfPath}`);
    process.exit(1);
  }

  return { pdfPath, year, session };
}

// ---------------------------------------------------------------------------
// PDF 텍스트 추출
// ---------------------------------------------------------------------------

async function extractTextFromPdf(pdfPath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

// ---------------------------------------------------------------------------
// 교시 섹션 분리
// 교시 헤더 패턴: "제1교시", "제2교시", "제3교시" 또는 "1교시", "2교시", "3교시"
// ---------------------------------------------------------------------------

interface SessionSection {
  session: number; // 1, 2, 3
  sessionName: string; // '교육학', '전공A', '전공B'
  text: string;
}

function splitIntoSessions(fullText: string): SessionSection[] {
  // 교시 구분자 패턴
  const sessionPattern = /(?:제\s*)?([1-3])\s*교시/g;
  const sessionNames: Record<string, string> = {
    '1': '교육학',
    '2': '전공A',
    '3': '전공B',
  };

  const sections: SessionSection[] = [];
  const matches: Array<{ index: number; session: string }> = [];

  let match: RegExpExecArray | null;
  while ((match = sessionPattern.exec(fullText)) !== null) {
    matches.push({ index: match.index, session: match[1] });
  }

  if (matches.length === 0) {
    // 교시 구분을 찾지 못한 경우 전체를 하나의 섹션으로 처리
    console.warn('경고: 교시 구분자를 찾지 못했습니다. 전체 텍스트를 단일 섹션으로 처리합니다.');
    sections.push({
      session: 2,
      sessionName: '전공A',
      text: fullText,
    });
    return sections;
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : fullText.length;
    sections.push({
      session: parseInt(matches[i].session, 10),
      sessionName: sessionNames[matches[i].session] || `${matches[i].session}교시`,
      text: fullText.slice(start, end),
    });
  }

  return sections;
}

// ---------------------------------------------------------------------------
// 문항 단위로 분리
// KICE 문항 형식: "1." 또는 "1 " + 번호로 시작하는 줄
// 배점 패턴: "[4점]", "【4점】", "(4점)"
// ---------------------------------------------------------------------------

interface RawQuestion {
  number: number;
  points: number; // 배점 (2점=기입형, 4~5점=서술형, 20점=논술형)
  rawText: string; // 원본 텍스트 (사례 포함)
}

function extractQuestions(sectionText: string): RawQuestion[] {
  const questions: RawQuestion[] = [];

  // 문항 번호 패턴: 줄 시작에서 숫자 + 점(.) 또는 숫자 단독
  // KICE PDF는 보통 "1." 또는 "1\n" 형식
  const questionPattern = /(?:^|\n)\s*(\d{1,2})\s*[.．]\s/gm;

  const questionStarts: Array<{ index: number; number: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = questionPattern.exec(sectionText)) !== null) {
    const qNumber = parseInt(match[1], 10);
    // 1~10번 문항만 인식 (페이지 번호 등 노이즈 제거)
    if (qNumber >= 1 && qNumber <= 10) {
      questionStarts.push({
        index: match.index,
        number: qNumber,
      });
    }
  }

  for (let i = 0; i < questionStarts.length; i++) {
    const start = questionStarts[i].index;
    const end = i + 1 < questionStarts.length ? questionStarts[i + 1].index : sectionText.length;
    const rawText = sectionText.slice(start, end).trim();

    // 배점 추출: [4점], 【4점】, (4점), 4점 등
    const pointsMatch = rawText.match(/[[\[【(]\s*(\d{1,2})\s*점\s*[\]】)]/);
    const points = pointsMatch ? parseInt(pointsMatch[1], 10) : 0;

    questions.push({
      number: questionStarts[i].number,
      points,
      rawText,
    });
  }

  return questions;
}

// ---------------------------------------------------------------------------
// 문항 유형 판별
// 기준: 배점 + 키워드 분석
//   2점 → fill_in (기입형)
//   4~5점 → descriptive (서술형)
//   20점 → descriptive (논술형)
//   "①②③④⑤" 포함 → multiple (선택형, KICE 중등특수에는 없지만 호환용)
// ---------------------------------------------------------------------------

function determineQuizType(rawText: string, points: number): QuizType {
  // 선택지 기호가 있으면 선택형
  if (/[①②③④⑤]/.test(rawText)) {
    return 'multiple';
  }
  // 2점 기입형
  if (points === 2) {
    return 'fill_in';
  }
  // 4점 이상 서술형/논술형
  if (points >= 4) {
    return 'descriptive';
  }
  // 배점 미확인 시 텍스트 키워드로 추측
  if (/기입|빈칸을?\s*채우|괄호\s*안/.test(rawText)) {
    return 'fill_in';
  }
  return 'descriptive';
}

// ---------------------------------------------------------------------------
// 사례(케이스 컨텍스트) 추출
// KICE 문항에서 사례는 보통 <작성 방법>, <조건>, [가], [나] 등으로 표시되거나
// "다음은 ~에 관한 사례이다", "다음 사례를 읽고" 등의 도입부로 시작됨
// ---------------------------------------------------------------------------

function extractCaseContext(rawText: string): { question: string; caseContext?: string } {
  // 사례 도입부 패턴
  const caseIntroPatterns = [
    /다음은\s+.{1,40}(?:사례|상황|내용|글)이다[.。]?/,
    /다음\s+사례를?\s+읽고/,
    /다음\s+(?:글|내용|자료)을?\s+읽고/,
    /(?:\[가\]|\[나\]|가\.|나\.)/, // 다중 사례 표지
  ];

  // <작성 방법> 또는 <조건> 이전까지를 사례로 간주
  const conditionPattern = /<\s*(?:작성\s*방법|조건|답안\s*작성\s*시\s*유의\s*사항)\s*>/;
  const conditionMatch = conditionPattern.exec(rawText);

  if (conditionMatch) {
    const beforeCondition = rawText.slice(0, conditionMatch.index).trim();
    const afterStart = rawText.slice(conditionMatch.index);

    // 사례 블록이 도입부 이후에 존재하는지 확인
    const hasCaseIntro = caseIntroPatterns.some((p) => p.test(beforeCondition));
    if (hasCaseIntro) {
      return {
        caseContext: beforeCondition,
        question: afterStart,
      };
    }
  }

  // 괄호형 사례 블록 패턴: [사례], 【사례】, ─────── 등의 구분선으로 감싸인 블록
  const caseBlockPattern = /(?:─{5,}|━{5,}|={5,}|-{5,})\n([\s\S]+?)\n(?:─{5,}|━{5,}|={5,}|-{5,})/;
  const caseBlockMatch = caseBlockPattern.exec(rawText);
  if (caseBlockMatch) {
    const caseContext = caseBlockMatch[0].trim();
    const question = rawText.replace(caseBlockMatch[0], '').trim();
    return { caseContext, question };
  }

  // 사례 블록을 찾지 못한 경우 전체를 문항 텍스트로 반환
  return { question: rawText };
}

// ---------------------------------------------------------------------------
// 문항 번호에서 subject/chapter 추정
// 실제 분류는 수동 검토가 필요하므로 임시 값을 부여하고 메타데이터에 기록
// ---------------------------------------------------------------------------

function estimateSubjectAndChapter(
  sessionNumber: number,
  questionNumber: number
): { subject: string; chapter: string } {
  // 1교시: 교육학 논술
  if (sessionNumber === 1) {
    return { subject: 'introduction', chapter: 'understanding' };
  }
  // 2교시 전공A: 기입형 1~4, 서술형 5~8
  if (sessionNumber === 2) {
    if (questionNumber <= 4) return { subject: 'introduction', chapter: 'understanding' };
    return { subject: 'curriculum', chapter: 'iep' };
  }
  // 3교시 전공B: 기입형 1~2, 서술형 3~6
  if (sessionNumber === 3) {
    if (questionNumber <= 2) return { subject: 'behavior-support', chapter: 'aba' };
    return { subject: 'inclusive-education', chapter: 'theory' };
  }
  return { subject: 'introduction', chapter: 'understanding' };
}

// ---------------------------------------------------------------------------
// 난이도 추정 (배점 기반)
// ---------------------------------------------------------------------------

function estimateDifficulty(points: number): 1 | 2 | 3 {
  if (points <= 2) return 1;
  if (points <= 4) return 2;
  return 3; // 5점 이상 또는 논술형
}

// ---------------------------------------------------------------------------
// RawQuestion → QuizQuestion 변환
// ---------------------------------------------------------------------------

function convertToQuizQuestion(
  raw: RawQuestion,
  sessionNumber: number,
  year: number
): QuizQuestion {
  const { question, caseContext } = extractCaseContext(raw.rawText);
  const type = determineQuizType(raw.rawText, raw.points);
  const { subject, chapter } = estimateSubjectAndChapter(sessionNumber, raw.number);

  const sessionLabel = sessionNumber === 1 ? '1교시' : sessionNumber === 2 ? '2교시전공A' : '3교시전공B';
  const id = `kice-${year}-${sessionLabel}-q${String(raw.number).padStart(2, '0')}`;

  return {
    id,
    subject,
    chapter,
    type,
    question: question.trim(),
    ...(caseContext ? { caseContext: caseContext.trim() } : {}),
    // 정답과 해설은 PDF에서 직접 추출이 어려우므로 빈 문자열로 초기화
    // → 수동 입력 또는 별도 해설지 파싱 필요
    answer: type === 'fill_in' ? '' : '',
    explanation: '⚠️ 해설 미입력 - 수동 검토 후 입력 필요',
    difficulty: estimateDifficulty(raw.points),
    source: `KICE ${year}년 중등특수교사 임용고시 ${sessionLabel} ${raw.number}번 (${raw.points}점)`,
    tags: {
      year,
      round: sessionNumber,
    },
  };
}

// ---------------------------------------------------------------------------
// 선택지(①②③④⑤) 추출 (복수선택형 호환)
// ---------------------------------------------------------------------------

function extractOptions(rawText: string): string[] | undefined {
  const optionPattern = /([①②③④⑤])\s*(.+?)(?=\s*[①②③④⑤]|$)/g;
  const options: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = optionPattern.exec(rawText)) !== null) {
    options.push(match[2].trim());
  }
  return options.length > 0 ? options : undefined;
}

// ---------------------------------------------------------------------------
// 메인 실행
// ---------------------------------------------------------------------------

async function main() {
  const { pdfPath, year, session } = parseArgs();

  console.log(`\nKICE PDF 파싱 시작`);
  console.log(`  파일: ${pdfPath}`);
  console.log(`  연도: ${year}`);
  console.log(`  교시 필터: ${session}교시 (0=전체)`);

  // 1. PDF 텍스트 추출
  console.log('\n[1/4] PDF 텍스트 추출 중...');
  let fullText: string;
  try {
    fullText = await extractTextFromPdf(pdfPath);
    console.log(`  추출 완료: ${fullText.length.toLocaleString()} 글자`);
  } catch (err) {
    console.error('PDF 파싱 오류:', err);
    process.exit(1);
  }

  // 2. 교시 섹션 분리
  console.log('\n[2/4] 교시 섹션 분리 중...');
  const allSections = splitIntoSessions(fullText);
  const targetSections = session === 0
    ? allSections
    : allSections.filter((s) => s.session === session);

  console.log(`  발견된 교시: ${allSections.map((s) => `${s.session}교시(${s.sessionName})`).join(', ')}`);
  console.log(`  처리 대상: ${targetSections.map((s) => `${s.session}교시`).join(', ')}`);

  // 3. 문항 파싱
  console.log('\n[3/4] 문항 파싱 중...');
  const allQuestions: QuizQuestion[] = [];

  for (const sect of targetSections) {
    const rawQuestions = extractQuestions(sect.text);
    console.log(`  ${sect.session}교시(${sect.sessionName}): ${rawQuestions.length}문항 발견`);

    for (const raw of rawQuestions) {
      const q = convertToQuizQuestion(raw, sect.session, year);

      // 선택지가 있는 경우 추가
      const options = extractOptions(raw.rawText);
      if (options) {
        q.options = options;
      }

      allQuestions.push(q);
    }
  }

  console.log(`  총 ${allQuestions.length}문항 파싱 완료`);

  // 4. JSON 출력
  console.log('\n[4/4] JSON 파일 생성 중...');
  const outputDir = path.join(path.dirname(process.argv[1]), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sessionLabel = session === 0 ? 'all' : `session${session}`;
  const outputFile = path.join(outputDir, `kice-${year}-${sessionLabel}.json`);

  const output = {
    meta: {
      source: 'KICE 중등특수교사 임용고시',
      year,
      session: session === 0 ? '전체' : `${session}교시`,
      parsedAt: new Date().toISOString(),
      totalQuestions: allQuestions.length,
      notes: [
        '⚠️ 이 파일은 자동 파싱 결과입니다.',
        '⚠️ answer, explanation 필드는 수동 입력이 필요합니다.',
        '⚠️ subject, chapter 분류는 추정값이므로 검토가 필요합니다.',
        '⚠️ 게시 전 KICE 공식 자료와 반드시 대조·검토하세요.',
      ],
    },
    questions: allQuestions,
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n완료! 출력 파일: ${outputFile}`);
  console.log(`파싱된 문항 수: ${allQuestions.length}`);

  // 파싱 결과 요약 출력
  const fillInCount = allQuestions.filter((q) => q.type === 'fill_in').length;
  const descriptiveCount = allQuestions.filter((q) => q.type === 'descriptive').length;
  const multipleCount = allQuestions.filter((q) => q.type === 'multiple').length;
  console.log(`  기입형: ${fillInCount}문항`);
  console.log(`  서술형/논술형: ${descriptiveCount}문항`);
  if (multipleCount > 0) console.log(`  선택형: ${multipleCount}문항`);

  console.log('\n다음 단계:');
  console.log('  1. 출력된 JSON 파일을 열어 문항 텍스트 확인');
  console.log('  2. 각 문항의 answer, explanation 직접 입력');
  console.log('  3. subject, chapter 분류 검토 및 수정');
  console.log('  4. 완성된 JSON을 src/data/quizzes/ 에 복사');
}

main().catch((err) => {
  console.error('예기치 않은 오류:', err);
  process.exit(1);
});
