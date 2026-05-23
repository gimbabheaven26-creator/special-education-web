import examStructure from '@/data/exam-structure.json';

export interface OfficialExamFormat {
  type: string;
  count: number;
  pointsEach: number;
  totalPoints: number;
}

export interface OfficialExamPaper {
  label: string;
  period: string;
  durationMinutes: number;
  totalPoints: number;
  officialQuestionCount: number;
  formats: OfficialExamFormat[];
}

export interface CompressedExamPaper extends OfficialExamPaper {
  selectedQuestionCount: number;
}

export interface MockExamQuestionMeta {
  paperLabel: string;
  period: string;
  questionNumber: number;
  format: string;
  points: number;
}

const paperPeriods: Record<string, string> = {
  '전공A': '2교시',
  '전공B': '3교시',
};

function getOfficialExamPapers(): OfficialExamPaper[] {
  return Object.entries(examStructure.examFormat).map(([label, paper]) => {
    const formats = paper.questions.map((question) => ({
      type: question.type,
      count: question.count,
      pointsEach: question.pointsEach,
      totalPoints: question.count * question.pointsEach,
    }));

    return {
      label,
      period: paperPeriods[label] ?? label,
      durationMinutes: paper.duration,
      totalPoints: paper.totalPoints,
      officialQuestionCount: formats.reduce((sum, format) => sum + format.count, 0),
      formats,
    };
  });
}

function distributeByWeight<T>(
  items: readonly T[],
  targetCount: number,
  getWeight: (item: T) => number,
): number[] {
  if (targetCount <= 0 || items.length === 0) {
    return items.map(() => 0);
  }

  const totalWeight = items.reduce((sum, item) => sum + getWeight(item), 0);
  if (totalWeight <= 0) {
    return items.map((_, index) => (index < targetCount ? 1 : 0));
  }

  const allocations = items.map((item, index) => {
    const exact = (targetCount * getWeight(item)) / totalWeight;
    return {
      index,
      count: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });

  let remaining = targetCount - allocations.reduce((sum, item) => sum + item.count, 0);
  for (const allocation of [...allocations].sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder;
    return a.index - b.index;
  })) {
    if (remaining <= 0) break;
    allocation.count += 1;
    remaining -= 1;
  }

  return allocations
    .sort((a, b) => a.index - b.index)
    .map((allocation) => allocation.count);
}

export const officialSpecialEducationExamPapers = getOfficialExamPapers();

export function getOfficialExamTotals() {
  return officialSpecialEducationExamPapers.reduce(
    (totals, paper) => ({
      minutes: totals.minutes + paper.durationMinutes,
      points: totals.points + paper.totalPoints,
      questions: totals.questions + paper.officialQuestionCount,
    }),
    { minutes: 0, points: 0, questions: 0 },
  );
}

export function buildCompressedExamPapers(questionCount: number): CompressedExamPaper[] {
  const paperCounts = distributeByWeight(
    officialSpecialEducationExamPapers,
    questionCount,
    (paper) => paper.officialQuestionCount,
  );

  return officialSpecialEducationExamPapers.map((paper, index) => ({
    ...paper,
    selectedQuestionCount: paperCounts[index] ?? 0,
  }));
}

export function buildMockExamQuestionMeta(questionCount: number): MockExamQuestionMeta[] {
  const papers = buildCompressedExamPapers(questionCount);
  const slots: MockExamQuestionMeta[] = [];

  for (const paper of papers) {
    const formatCounts = distributeByWeight(
      paper.formats,
      paper.selectedQuestionCount,
      (format) => format.count,
    );
    let questionNumber = 1;

    paper.formats.forEach((format, index) => {
      const count = formatCounts[index] ?? 0;
      for (let offset = 0; offset < count; offset += 1) {
        slots.push({
          paperLabel: paper.label,
          period: paper.period,
          questionNumber,
          format: format.type,
          points: format.pointsEach,
        });
        questionNumber += 1;
      }
    });
  }

  return slots;
}
