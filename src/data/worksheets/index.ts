export type { WorksheetQuestion, WorksheetConfig } from './types';
export { SUBJECT_CODES } from './types';

export { behaviorSupportWorksheets, behaviorSupportTopics } from './behavior-support';
export { introductionWorksheets, introductionTopics } from './introduction';
export { lawsWorksheets, lawsTopics } from './laws';
export { curriculumWorksheets, curriculumTopics } from './curriculum';
export { assessmentWorksheets, assessmentTopics } from './assessment';
export { inclusiveEducationWorksheets, inclusiveEducationTopics } from './inclusive-education';
export { transitionWorksheets, transitionTopics } from './transition';

import type { WorksheetQuestion } from './types';
import { behaviorSupportWorksheets, behaviorSupportTopics } from './behavior-support';
import { introductionWorksheets, introductionTopics } from './introduction';
import { lawsWorksheets, lawsTopics } from './laws';
import { curriculumWorksheets, curriculumTopics } from './curriculum';
import { assessmentWorksheets, assessmentTopics } from './assessment';
import { inclusiveEducationWorksheets, inclusiveEducationTopics } from './inclusive-education';
import { transitionWorksheets, transitionTopics } from './transition';

/** 과목별 전체 문제 은행 */
export const worksheetsBySubject: Record<string, WorksheetQuestion[]> = {
  'behavior-support': behaviorSupportWorksheets,
  'introduction': introductionWorksheets,
  'laws': lawsWorksheets,
  'curriculum': curriculumWorksheets,
  'assessment': assessmentWorksheets,
  'inclusive-education': inclusiveEducationWorksheets,
  'transition': transitionWorksheets,
};

/** 과목별 토픽 정보 */
export const topicsBySubject: Record<string, Record<string, { name: string; questions: WorksheetQuestion[] }>> = {
  'behavior-support': behaviorSupportTopics,
  'introduction': introductionTopics,
  'laws': lawsTopics,
  'curriculum': curriculumTopics,
  'assessment': assessmentTopics,
  'inclusive-education': inclusiveEducationTopics,
  'transition': transitionTopics,
};

/** 전체 문제 은행 */
export const allWorksheetQuestions: WorksheetQuestion[] = [
  ...behaviorSupportWorksheets,
  ...introductionWorksheets,
  ...lawsWorksheets,
  ...curriculumWorksheets,
  ...assessmentWorksheets,
  ...inclusiveEducationWorksheets,
  ...transitionWorksheets,
];

/**
 * 과목 + 토픽으로 문제 조회
 */
export function getWorksheetQuestions(
  subject: string,
  topicId: string,
): WorksheetQuestion[] {
  const topics = topicsBySubject[subject];
  if (!topics) return [];
  const topic = topics[topicId];
  return topic ? topic.questions : [];
}

/**
 * 과목으로 문제 조회
 */
export function getQuestionsBySubject(subject: string): WorksheetQuestion[] {
  return worksheetsBySubject[subject] || [];
}

/**
 * 사용 가능한 토픽 목록 (해당 과목에 문제가 있는 토픽만)
 */
export function getAvailableTopics(subject: string): { id: string; name: string; count: number }[] {
  const topics = topicsBySubject[subject];
  if (!topics) return [];
  return Object.entries(topics).map(([id, { name, questions }]) => ({
    id,
    name,
    count: questions.length,
  }));
}
