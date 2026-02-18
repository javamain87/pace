import type { ExpenseItem, DecisionResult, DecisionOutput } from '../types/finance'
import { generateAlternatives } from '../services/AlternativeRecommendationEngine'

export type { DecisionResult, DecisionOutput }

const ADJUSTABILITY_BONUS: Record<string, number> = {
  easy: 25,
  possible: 10,
  impossible: -15,
}

const CATEGORY_BONUS: Record<string, number> = {
  subscription: 10,
  utility: 5,
  other: 0,
  insurance: -5,
  loan: -10,
  housing: -5,
}

const AMOUNT_PENALTY_PER_MANWON = 0.5
const MAX_AMOUNT_PENALTY = 35
const BASE_SCORE = 50

/**
 * Evaluate a single expense and return score + status.
 */
export function evaluateExpense(expense: ExpenseItem): DecisionResult {
  const amount = Math.max(0, expense.amountKRW)
  const manwon = amount / 10_000
  const adjBonus = ADJUSTABILITY_BONUS[expense.adjustableLevel] ?? 0
  const catBonus = CATEGORY_BONUS[expense.category] ?? 0
  const amountPenalty = Math.min(MAX_AMOUNT_PENALTY, manwon * AMOUNT_PENALTY_PER_MANWON)

  const rawScore = BASE_SCORE + adjBonus + catBonus - amountPenalty
  const score = Math.round(Math.max(0, Math.min(100, rawScore)))

  let status: DecisionResult['status']
  if (score >= 70) status = 'ALLOW'
  else if (score >= 50) status = 'WARN'
  else status = 'BLOCK'

  return { score, status }
}

/**
 * Evaluate expense with alternatives when score < 70.
 */
export async function evaluateExpenseDetailed(expense: ExpenseItem): Promise<DecisionOutput> {
  const decision = evaluateExpense(expense)

  if (decision.score >= 70) {
    return { decision }
  }

  const alternatives = await generateAlternatives(expense)
  return {
    decision,
    alternatives: alternatives.length > 0 ? alternatives : undefined,
  }
}
