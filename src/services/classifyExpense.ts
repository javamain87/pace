import type { CategoryType, ExpenseCategory } from '../types/finance'

export type ClassificationResult = {
  category: CategoryType
  confidence: number
  /** Use for storage when present (loan, insurance, utility); else use mapped category */
  expenseCategory?: ExpenseCategory
}

/**
 * Classify expense from raw text.
 * Replace the mock implementation with actual API call when endpoint is available.
 *
 * Mock: keyword-based local classification (no external API).
 * Real: POST to AI endpoint with rawText, return parsed { category, confidence }.
 */
export async function classifyExpense(rawText: string): Promise<ClassificationResult> {
  const t = rawText.toLowerCase().trim()
  if (!t) return { category: 'misc', confidence: 0.3 }

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 80 + Math.random() * 120))

  // Keyword-based mock (replace with fetch to AI endpoint)
  const match = matchKeywords(t)
  if (match) return match

  return { category: 'misc', confidence: 0.5 }
}

function matchKeywords(t: string): ClassificationResult | null {
  const impactRules: Array<{ keywords: string[]; expenseCategory: ExpenseCategory; category: CategoryType; confidence: number }> = [
    { keywords: ['대출', 'loan', 'mortgage', '카드값', '할부'], expenseCategory: 'loan', category: 'misc', confidence: 0.92 },
    { keywords: ['보험', 'insurance'], expenseCategory: 'insurance', category: 'health', confidence: 0.9 },
    { keywords: ['통신', 'kt', 'sk', 'lg', 'phone', '요금'], expenseCategory: 'utility', category: 'misc', confidence: 0.88 },
  ]

  for (const r of impactRules) {
    if (r.keywords.some((k) => t.includes(k))) {
      return { category: r.category, confidence: r.confidence, expenseCategory: r.expenseCategory }
    }
  }

  const rules: Array<{ keywords: string[]; category: CategoryType; confidence: number }> = [
    { keywords: ['넷플릭스', '유튜브', 'spotify', '구독', 'subscription'], category: 'subscription', confidence: 0.9 },
    { keywords: ['렌탈', 'rental', '월세', '전세', '집'], category: 'housing', confidence: 0.88 },
    { keywords: ['식비', '외식', '카페', '맛집', 'food', '밥', '점심', '저녁'], category: 'food', confidence: 0.85 },
    { keywords: ['교통', '주유', '지하철', '버스', '택시', 'transport', 'car'], category: 'transport', confidence: 0.85 },
    { keywords: ['학원', '교육', 'education', '수업'], category: 'education', confidence: 0.85 },
    { keywords: ['병원', '약', '건강', 'health', '치과'], category: 'health', confidence: 0.85 },
    { keywords: ['영화', '게임', 'entertainment', '취미'], category: 'entertainment', confidence: 0.82 },
    { keywords: ['펫', '육아', '가족', 'family'], category: 'family', confidence: 0.8 },
    { keywords: ['투자', '적금', '예금', 'investment'], category: 'investment', confidence: 0.85 },
  ]

  for (const { keywords, category, confidence } of rules) {
    if (keywords.some((k) => t.includes(k))) return { category, confidence, expenseCategory: mapCategoryTypeToExpense(category) }
  }

  return null
}

const CATEGORY_TYPE_TO_EXPENSE: Record<CategoryType, ExpenseCategory> = {
  food: 'other',
  transport: 'other',
  housing: 'housing',
  subscription: 'subscription',
  investment: 'other',
  education: 'other',
  health: 'insurance',
  entertainment: 'other',
  family: 'other',
  misc: 'other',
}

export function mapCategoryTypeToExpense(ct: CategoryType): ExpenseCategory {
  return CATEGORY_TYPE_TO_EXPENSE[ct]
}
