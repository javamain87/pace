import type { ExpenseItem, ExpenseCategory, AdjustableLevel, StructureInput } from '../types/finance'

export type ImpactDifficulty = 'low' | 'medium' | 'high'

export type ImpactResult = {
  impactScore: number
  estimatedMonthlyReductionRange: [number, number]
  difficulty: ImpactDifficulty
}

/** Base reduction config per category. telecom = utility. rental = housing. */
const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  | { type: 'ratio'; minRatio: number; maxRatio: number; difficulty: ImpactDifficulty }
  | { type: 'fixed'; minKRW: number; maxKRW: number; difficulty: ImpactDifficulty }
> = {
  loan: { type: 'ratio', minRatio: 0.01, maxRatio: 0.03, difficulty: 'high' },
  insurance: { type: 'ratio', minRatio: 0.05, maxRatio: 0.15, difficulty: 'medium' },
  utility: { type: 'fixed', minKRW: 10_000, maxKRW: 60_000, difficulty: 'low' },
  subscription: { type: 'ratio', minRatio: 0, maxRatio: 1, difficulty: 'low' },
  housing: { type: 'ratio', minRatio: 0.05, maxRatio: 0.1, difficulty: 'high' },
  other: { type: 'ratio', minRatio: 0.05, maxRatio: 0.15, difficulty: 'medium' },
}

const ADJUSTABLE_LEVEL_WEIGHT: Record<AdjustableLevel, number> = {
  easy: 1.0,
  possible: 0.6,
  impossible: 0.2,
}

const DIFFICULTY_WEIGHT: Record<ImpactDifficulty, number> = {
  low: 1.0,
  medium: 0.7,
  high: 0.4,
}

/**
 * Calculate impact for a single expense item.
 * impactScore = estimatedReductionRatio × adjustableLevelWeight × difficultyWeight
 */
export function calculateImpact(
  item: ExpenseItem,
  _structure: StructureInput
): ImpactResult {
  const amount = Math.max(0, item.amountKRW)
  const config = CATEGORY_CONFIG[item.category]
  const difficulty = config.difficulty
  const adjWeight = ADJUSTABLE_LEVEL_WEIGHT[item.adjustableLevel]
  const diffWeight = DIFFICULTY_WEIGHT[difficulty]

  let estimatedMonthlyReductionRange: [number, number]
  let estimatedReductionRatio: number

  if (config.type === 'ratio') {
    const min = amount * config.minRatio
    const max = amount * config.maxRatio
    estimatedMonthlyReductionRange = [min, max]
    estimatedReductionRatio = amount > 0 ? (config.minRatio + config.maxRatio) / 2 : 0
  } else {
    const min = Math.min(config.minKRW, amount)
    const max = Math.min(config.maxKRW, amount)
    estimatedMonthlyReductionRange = [min, max]
    estimatedReductionRatio = amount > 0 ? Math.min(1, ((config.minKRW + config.maxKRW) / 2) / amount) : 0
  }

  const impactScore = estimatedReductionRatio * adjWeight * diffWeight

  return {
    impactScore: Number.isFinite(impactScore) ? impactScore : 0,
    estimatedMonthlyReductionRange,
    difficulty,
  }
}
