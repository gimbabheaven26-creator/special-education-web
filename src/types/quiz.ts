export type QuizType = 'multiple' | 'ox' | 'fill_in' | 'descriptive' | 'scenario_composite';

export interface SubQuestion {
  id: string;
  question: string;
  type: 'fill_in' | 'descriptive';
  answer: string;
  explanation?: string;
}

export interface QuizQuestion {
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
  subQuestions?: SubQuestion[];
  imageUrl?: string;
}

export interface QuizResult {
  questionId: string;
  userAnswer: string | number;
  isCorrect: boolean;
  timestamp: number;
  subject: string;
  chapter: string;
}

export interface ExamQuestion extends QuizQuestion {
  year: number;
  questionNumber: number;
}
