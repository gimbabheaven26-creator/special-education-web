/**
 * 학습지(워크시트) 문제 은행 타입 정의
 * 일일수학(11math.com) 스타일의 동형문제 생성 시스템
 */

export interface WorksheetQuestion {
  id: string;
  topicId: string;          // e.g., 'differential-reinforcement'
  subject: string;          // e.g., 'behavior-support'
  type: 'fill_in' | 'descriptive';
  difficulty: 1 | 2 | 3;
  question: string;
  answer: string;
  explanation: string;
  source?: string;          // e.g., 'KICE 2024 전공A 3번 동형'
  tags?: string[];
}

export interface WorksheetConfig {
  id: string;               // unique worksheet ID like 'SP-BH-0042'
  subject: string;
  topicId: string;
  topicName: string;
  type: 'fill_in' | 'descriptive' | 'mixed';
  questionCount: number;    // 8 for fill_in A4, 4 for descriptive A4
  questions: WorksheetQuestion[];
  createdAt: string;
}

/** 과목별 코드 매핑 (학습지 ID 생성용) */
export const SUBJECT_CODES: Record<string, string> = {
  'behavior-support': 'BH',
  'introduction': 'IN',
  'laws': 'LW',
  'curriculum': 'CR',
  'assessment': 'AS',
  'inclusive-education': 'IE',
  'transition': 'TR',
};
