export type StructureInput = {
  lowestIncome: number;
  fixedExpenses: number;
  variableExpenses: number;
  emergencyFund: number;
  targetMonths: 3 | 6 | 9 | 12;
  incomeDay: number;
};

export type RecommendationStatus = 'pending' | 'accepted' | 'deferred'

export type Cycle = {
  id: string;
  startedAtISO: string;
  snapshot: StructureInput;
  scoreAtStart: number;
  recommendedActionId: string;
  recommendationStatus: RecommendationStatus;
  recommendationUpdatedAtISO?: string;
};

export type ExpenseCategory =
  | 'housing'
  | 'insurance'
  | 'loan'
  | 'subscription'
  | 'utility'
  | 'other'

/** AI classification categories (maps to ExpenseCategory for impact engine) */
export type CategoryType =
  | 'food'
  | 'transport'
  | 'housing'
  | 'subscription'
  | 'investment'
  | 'education'
  | 'health'
  | 'entertainment'
  | 'family'
  | 'misc'

export type AdjustableLevel = 'impossible' | 'possible' | 'easy'

export type DecisionStatus = 'ALLOW' | 'WARN' | 'BLOCK'

export type DecisionResult = {
  score: number
  status: DecisionStatus
}

export type AlternativeOption = {
  title: string
  expectedCost: number
  savingAmount: number
  savingPercent: number
  reason: string
}

export type DecisionOutput = {
  decision: DecisionResult
  alternatives?: AlternativeOption[]
}

export type ExpenseItem = {
  id: string;
  /** Display name (alias: title) */
  name: string;
  amountKRW: number;
  category: ExpenseCategory;
  adjustableLevel: AdjustableLevel;
  /** Raw input for classification */
  rawText?: string;
  /** 0–1, from AI classifier */
  confidence?: number;
  /** ISO string */
  createdAt?: string;
  /** Skip reclassification if true */
  manuallyEdited?: boolean;
};