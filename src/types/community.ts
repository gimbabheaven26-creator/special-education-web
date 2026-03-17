export type QuestionType = 'multiple' | 'ox' | 'fill_in' | 'descriptive';
export type QuestionStatus = 'pending' | 'official';
export type VoteType = 'up' | 'down';
export type SortOrder = 'latest' | 'votes';

export interface CommunityQuestion {
  id: string;
  author_id: string;
  author_display_name: string;
  question_type: QuestionType;
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  subject_id: string;
  chapter_id: string | null;
  status: QuestionStatus;
  vote_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityQuestionDetail extends CommunityQuestion {
  user_vote: VoteType | null;
}

export interface CreateQuestionInput {
  question_type: QuestionType;
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  subject_id: string;
  chapter_id: string | null;
}
