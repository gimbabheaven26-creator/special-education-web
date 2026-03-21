import type { Scenario } from '@/types/scenario';

import bds01 from './bds-01-fba-self-injury.json';
import bds02 from './bds-02-inclusive-education.json';
import bds03 from './bds-03-pbs-aggression.json';
import bds04 from './bds-04-autism-communication.json';
import bds05 from './bds-05-physical-disability.json';
import bds06 from './bds-06-learning-disability.json';
import bds07 from './bds-07-visual-impairment.json';
import bds08 from './bds-08-hearing-impairment.json';
import bds09 from './bds-09-transition.json';
import bds10 from './bds-10-iep.json';
import spacedDro01 from './spaced-dro-01-classroom.json';
import spacedDro02 from './spaced-dro-02-playground.json';
import spacedDro03 from './spaced-dro-03-cafeteria.json';

export const ALL_SCENARIOS: readonly Scenario[] = [
  bds01 as Scenario,
  bds02 as Scenario,
  bds03 as Scenario,
  bds04 as Scenario,
  bds05 as Scenario,
  bds06 as Scenario,
  bds07 as Scenario,
  bds08 as Scenario,
  bds09 as Scenario,
  bds10 as Scenario,
  spacedDro01 as Scenario,
  spacedDro02 as Scenario,
  spacedDro03 as Scenario,
];

/** BDS 시나리오만 (기존 단일 시나리오) */
export const BDS_SCENARIOS: readonly Scenario[] = [
  bds01 as Scenario,
  bds02 as Scenario,
  bds03 as Scenario,
  bds04 as Scenario,
  bds05 as Scenario,
  bds06 as Scenario,
  bds07 as Scenario,
  bds08 as Scenario,
  bds09 as Scenario,
  bds10 as Scenario,
];

/** 스페이스드 시나리오만 */
export const SPACED_SCENARIOS: readonly Scenario[] = [
  spacedDro01 as Scenario,
  spacedDro02 as Scenario,
  spacedDro03 as Scenario,
];

export function getScenarioById(id: string): Scenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === id);
}

export function getScenariosBySubject(subject: string): readonly Scenario[] {
  return ALL_SCENARIOS.filter((s) => s.subject === subject);
}

export { SCENARIO_GROUPS, getGroupById, getGroupByScenarioId } from './groups';
