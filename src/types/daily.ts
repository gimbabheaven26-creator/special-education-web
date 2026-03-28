export interface DailyQuestion {
  id: string;
  type: 'ox' | 'fill_in' | 'descriptive';
  question: string;
  answer: string;
  chapter: string;
  subject: string;
  explanation?: string;
}

export type Step = 1 | 2 | 3;

export const OX_COUNT = 10;
export const FILL_IN_COUNT = 5;
export const DESCRIPTIVE_COUNT = 3;
