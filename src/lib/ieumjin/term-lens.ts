import fbaSeed from '../../../data/ieumjin/term-seeds/fba.json';

export type TermLensStatus = 'source-linked' | 'verified' | 'ai-draft' | 'stale' | 'blocked';

export type TermSourceKind = 'nise' | 'concept' | 'kice' | 'analysis' | 'source-pack';

export type TermSourceRef = {
  kind: TermSourceKind;
  id: string;
  label: string;
  path: string;
};

export type KiceRef = {
  year: number;
  session: string;
  number: number;
  points: number;
  type: 'fill_in' | 'descriptive';
  label: string;
};

export type ExamDna = {
  representativeRef: Pick<KiceRef, 'year' | 'session' | 'number'>;
  format: string;
  scene: string;
  materials: string[];
  asks: string[];
  transformAxes: string[];
};

export type PracticeRubricItem = {
  id: string;
  label: string;
  points: number;
  keywordGroups: string[][];
  feedback: string;
  repairPrompt: string;
};

export type PracticeQuestion = {
  id: string;
  title: string;
  sourceLabel: string;
  prompt: string;
  answerGuide: string;
  rubric: PracticeRubricItem[];
};

export type PracticeReviewDelay = {
  days: number;
  label: string;
};

export type PracticeLoop = {
  storageKey: string;
  examQuestion: PracticeQuestion;
  analogQuestion: PracticeQuestion;
  reviewDelays: PracticeReviewDelay[];
};

export type TermLens = {
  id: string;
  status: TermLensStatus;
  term: {
    label: string;
    hanja?: string;
    english: string;
    aliases: string[];
  };
  ticket: string;
  subject: string;
  answerGoal: string;
  officialDefinition: {
    summary: string;
    sourceId: string;
  };
  distinction: {
    title: string;
    body: string;
  };
  sources: TermSourceRef[];
  conceptBridge: Array<{
    title: string;
    body: string;
  }>;
  kiceRefs: KiceRef[];
  examDna: ExamDna;
  analogSeed: {
    condition: string;
    task: string;
    guardrail: string;
    status: Extract<TermLensStatus, 'ai-draft' | 'source-linked' | 'verified'>;
  };
  practiceLoop: PracticeLoop;
  twentyMinuteFlow: Array<{
    minutes: number;
    title: string;
    prompt: string;
  }>;
};

const lenses: TermLens[] = [fbaSeed as TermLens];

function normalizeQuery(query: string | string[] | undefined): string {
  const value = Array.isArray(query) ? query[0] : query;
  return (value ?? '').trim().toLocaleLowerCase('ko-KR');
}

function matchesLens(lens: TermLens, query: string): boolean {
  if (!query) return true;

  const candidates = [lens.term.label, lens.term.english, ...lens.term.aliases];
  return candidates.some((candidate) => candidate.toLocaleLowerCase('ko-KR').includes(query));
}

export function getTermLensByQuery(query?: string | string[]): TermLens {
  const normalized = normalizeQuery(query);
  return lenses.find((lens) => matchesLens(lens, normalized)) ?? lenses[0];
}

export function getAllTermLenses(): TermLens[] {
  return lenses;
}
