import type { StructureInput, ExpenseItem } from '../types/finance'
import { calculateImpact } from './impactEngine'
import { formatKRWToManWon } from './format'

export type RecommendationActionId = 'expense-audit' | 'buffer-build' | 'variable-trim' | `expense-item-${string}`

export type Recommendation = {
  id: RecommendationActionId
  title: string
  reason: string
  impactText: string
  checklist: string[]
}

const RECOMMENDATIONS: Record<'expense-audit' | 'buffer-build' | 'variable-trim', Omit<Recommendation, 'id'>> = {
  'expense-audit': {
    title: '고정비 점검',
    reason: '고정비가 수입 대비 60% 이상입니다.',
    impactText: '고정비를 10% 줄이면 유지 가능 기간이 약 1~2개월 늘어날 수 있습니다.',
    checklist: [
      '구독·멤버십 중 미사용 항목 정리',
      '보험·대출 납부 조건 재검토',
      '통신비·공과금 요금제 점검',
      '월 단위로 지출 내역 확인',
    ],
  },
  'buffer-build': {
    title: '비상금 확보',
    reason: '비상금이 고정비 3개월분 미만입니다.',
    impactText: '비상금 50만원 추가 시 유지 가능 기간이 약 1.5개월 늘어납니다.',
    checklist: [
      '월 저축 가능액 설정',
      '자동 이체로 비상금 계좌 분리',
      '3개월 목표액 도달 시 다음 목표 설정',
      '비상금은 예·적금 위주로 보관',
    ],
  },
  'variable-trim': {
    title: '변동비 다듬기',
    reason: '기초가 갖춰진 상태입니다. 변동비를 조정해 보세요.',
    impactText: '변동비 10% 절감 시 월 약 10~30만원 여유가 생길 수 있습니다.',
    checklist: [
      '외식·카페 지출 주간 한도 설정',
      '필요 구매 전 24시간 대기',
      '할인·쿠폰 활용 습관화',
      '변동비 항목 월별 기록',
    ],
  },
}

const CHECKLIST_BY_CATEGORY: Record<string, string[]> = {
  housing: [
    '월세/관리비 협의 가능성 검토',
    '전세 전환 또는 보증금 조정 검토',
    '복비·단열 등 에너지 절감',
    '계약 갱신 시 조건 재협상',
  ],
  insurance: [
    '중복 보험 정리',
    '필요 보장 vs 현재 가입 비교',
    '연간 납입 방식 검토',
    '갱신 시 보험료 조정 가능성',
  ],
  loan: [
    '대출 통합·상환 구조 검토',
    '금리 인하 상품 비교',
    '불필요 대출 조기 상환',
    '원리금 상환 vs 거치형 비교',
  ],
  subscription: [
    '미사용 구독 해지',
    '연간 결제 할인 검토',
    '가족 공유 플랜 검토',
    '필요한 것만 남기기',
  ],
  utility: [
    '통신 요금제 변경 검토',
    '공과금 자동이체 할인',
    '에너지 사용 패턴 점검',
    '요금제 비교',
  ],
  other: [
    '월 지출 내역 확인',
    '필수 vs 선택 구분',
    '대체 가능한 항목 검색',
    '협상·할인 가능성 검토',
  ],
}

function formatRangeManwon(minKRW: number, maxKRW: number): string {
  const min = formatKRWToManWon(minKRW)
  const max = formatKRWToManWon(maxKRW)
  if (min === max) return `${min}만원`
  return `${min}~${max}만원`
}

function buildItemRecommendation(item: ExpenseItem, impact: { estimatedMonthlyReductionRange: [number, number] }): Recommendation {
  const [minKRW, maxKRW] = impact.estimatedMonthlyReductionRange
  const rangeStr = formatRangeManwon(minKRW, maxKRW)
  const checklist = CHECKLIST_BY_CATEGORY[item.category] ?? CHECKLIST_BY_CATEGORY.other
  const displayName = item.name?.trim() || '해당 항목'
  return {
    id: `expense-item-${item.id}` as RecommendationActionId,
    title: `${displayName} 조정`,
    reason: `${displayName} 항목을 검토하면 월 약 ${rangeStr} 절감 여지가 있습니다.`,
    impactText: `예상 절감: ${rangeStr}`,
    checklist,
  }
}

function getFallbackRecommendation(structure: StructureInput): Recommendation {
  const s = structure
  const lowestIncome = s.lowestIncome > 0 ? s.lowestIncome : 1
  const fixedExpenses = Math.max(0, s.fixedExpenses)
  const emergencyFund = Math.max(0, s.emergencyFund)
  const expenseRatio = fixedExpenses / lowestIncome
  const runwayMonths = fixedExpenses > 0 ? emergencyFund / fixedExpenses : 999

  let id: 'expense-audit' | 'buffer-build' | 'variable-trim'
  if (expenseRatio >= 0.6) {
    id = 'expense-audit'
  } else if (runwayMonths < 3) {
    id = 'buffer-build'
  } else {
    id = 'variable-trim'
  }

  return { id, ...RECOMMENDATIONS[id] }
}

export type RecommendationContext = {
  structure: StructureInput
  fixedExpenseItems: ExpenseItem[]
  variableExpenseItems: ExpenseItem[]
}

/**
 * Get the single highest-impact recommendation.
 * Uses expense items with impact scoring when available; falls back to legacy rules otherwise.
 */
export function getMonthlyRecommendation(
  structure: StructureInput,
  fixedExpenseItems: ExpenseItem[],
  variableExpenseItems: ExpenseItem[]
): Recommendation {
  const allItems = [...fixedExpenseItems, ...variableExpenseItems].filter(
    (it) => it.amountKRW > 0
  )

  if (allItems.length === 0) {
    return getFallbackRecommendation(structure)
  }

  const scored = allItems.map((item) => {
    const impact = calculateImpact(item, structure)
    return { item, impact }
  })

  scored.sort((a, b) => b.impact.impactScore - a.impact.impactScore)
  const top = scored[0]
  if (!top || top.impact.impactScore <= 0) {
    return getFallbackRecommendation(structure)
  }

  return buildItemRecommendation(top.item, top.impact)
}

/** Lookup recommendation by id. For item-based ids, pass context to resolve. */
export function getRecommendationById(
  id: string,
  context?: RecommendationContext
): Recommendation {
  const legacyKey = id as 'expense-audit' | 'buffer-build' | 'variable-trim'
  if (legacyKey in RECOMMENDATIONS) {
    return { id: legacyKey, ...RECOMMENDATIONS[legacyKey] }
  }

  if (id.startsWith('expense-item-') && context) {
    const itemId = id.slice('expense-item-'.length)
    const allItems = [...context.fixedExpenseItems, ...context.variableExpenseItems]
    const item = allItems.find((it) => it.id === itemId)
    if (item) {
      const impact = calculateImpact(item, context.structure)
      return buildItemRecommendation(item, impact)
    }
  }

  return { id: 'variable-trim', ...RECOMMENDATIONS['variable-trim'] }
}

/**
 * Get alternative action id. For item-based: returns next-highest-impact item.
 * No stacking: single recommendation per cycle.
 */
export function getAlternativeActionId(
  currentId: string,
  context?: RecommendationContext
): RecommendationActionId {
  if (!context) {
    const fallback: Record<string, RecommendationActionId> = {
      'expense-audit': 'buffer-build',
      'buffer-build': 'variable-trim',
      'variable-trim': 'expense-audit',
    }
    return fallback[currentId] ?? 'variable-trim'
  }

  const allItems = [...context.fixedExpenseItems, ...context.variableExpenseItems].filter(
    (it) => it.amountKRW > 0
  )

  if (allItems.length === 0) {
    return 'variable-trim'
  }

  const scored = allItems
    .map((item) => ({ item, impact: calculateImpact(item, context.structure) }))
    .sort((a, b) => b.impact.impactScore - a.impact.impactScore)

  if (currentId.startsWith('expense-item-')) {
    const idx = scored.findIndex((s) => s.item.id === currentId.slice('expense-item-'.length))
    if (idx >= 0 && idx + 1 < scored.length) {
      return `expense-item-${scored[idx + 1].item.id}` as RecommendationActionId
    }
    if (idx > 0) {
      return `expense-item-${scored[0].item.id}` as RecommendationActionId
    }
    return 'variable-trim'
  }

  const top = scored[0]
  if (top && top.impact.impactScore > 0) {
    return `expense-item-${top.item.id}` as RecommendationActionId
  }

  return 'variable-trim'
}
