import type { ExpenseCategory } from '../types/finance'

/**
 * Keyword-based auto-categorization for expense items.
 * Returns internal category keys; map to app ExpenseCategory where needed.
 */
export type AutoCategory =
  | 'loan'
  | 'insurance'
  | 'telecom'
  | 'subscription'
  | 'rental'
  | 'card-installment'
  | 'other'

export function autoCategorizeExpense(name: string): AutoCategory {
  const n = name.toLowerCase().trim()
  if (!n) return 'other'

  if (
    n.includes('대출') ||
    n.includes('loan') ||
    n.includes('mortgage') ||
    n.includes('카드값')
  )
    return 'loan'

  if (n.includes('보험') || n.includes('insurance')) return 'insurance'

  if (
    n.includes('통신') ||
    n.includes('kt') ||
    n.includes('sk') ||
    n.includes('lg') ||
    n.includes('phone') ||
    n.includes('mobile')
  )
    return 'telecom'

  if (
    n.includes('넷플릭스') ||
    n.includes('유튜브') ||
    n.includes('spotify') ||
    n.includes('구독') ||
    n.includes('subscription')
  )
    return 'subscription'

  if (n.includes('렌탈') || n.includes('rental')) return 'rental'

  if (n.includes('할부') || n.includes('installment')) return 'card-installment'

  return 'other'
}

/** Map AutoCategory to app ExpenseCategory (housing, insurance, loan, subscription, utility, other) */
const AUTO_TO_APP: Record<AutoCategory, ExpenseCategory> = {
  loan: 'loan',
  insurance: 'insurance',
  telecom: 'utility',
  subscription: 'subscription',
  rental: 'housing',
  'card-installment': 'loan',
  other: 'other',
}

export function autoCategorizeExpenseMapped(name: string): ExpenseCategory {
  return AUTO_TO_APP[autoCategorizeExpense(name)]
}
