// ─── Behavior Decision Simulator (BDS) Types ───

export interface ScenarioChoice {
  readonly label: string;
  readonly nextNodeId: string;
  readonly isOptimal: boolean;
  readonly feedback: string;
  readonly xpBonus: number;
}

export interface ScenarioNode {
  readonly id: string;
  readonly type: 'situation' | 'choice' | 'feedback' | 'assessment';
  readonly content: string;
  readonly choices?: readonly ScenarioChoice[];
  readonly relatedConcepts: readonly string[];
  readonly legalBasis?: string;
  readonly imageHint?: string;
}

export interface Scenario {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly subject: string;
  readonly chapter: string;
  readonly difficulty: 1 | 2 | 3;
  readonly estimatedMinutes: number;
  readonly nodes: Readonly<Record<string, ScenarioNode>>;
  readonly startNodeId: string;
  readonly tags: readonly string[];
}

export interface ScenarioProgress {
  readonly scenarioId: string;
  readonly visitedNodeIds: readonly string[];
  readonly optimalCount: number;
  readonly totalChoices: number;
  readonly xpEarned: number;
  readonly completedAt: number | null;
  readonly startedAt: number;
}
