import type { ExpenseItem } from '../types/finance'
import type { AlternativeOption } from '../types/finance'

const COFFEE_THRESHOLD_KRW = 5_000
const HOME_COFFEE_COST_KRW = 1_500
const CHEAPER_BRAND_COST_KRW = 3_000

const COFFEE_KEYWORDS = ['카페', '커피', 'coffee', 'cafe', '스타벅스', '이디야', '메가커피']
const SHOPPING_KEYWORDS = ['쇼핑', '구매', 'shopping', '아마존', '쿠팡', '다이소']

/**
 * Rule-based alternative generation.
 * Priority 1: Local rules. Priority 2: AI fallback (placeholder).
 */
export async function generateAlternatives(expense: ExpenseItem): Promise<AlternativeOption[]> {
  const ruleBased = applyRuleBasedAlternatives(expense)
  if (ruleBased.length > 0) return ruleBased

  // Priority 2: AI fallback (placeholder - do not implement)
  return aiGenerateAlternativesPlaceholder(expense)
}

function applyRuleBasedAlternatives(expense: ExpenseItem): AlternativeOption[] {
  const { name, amountKRW, category } = expense
  const amount = Math.max(0, amountKRW)
  const n = (name ?? '').toLowerCase().trim()
  const results: AlternativeOption[] = []

  // Rule: Coffee > 5000
  if (
    amount >= COFFEE_THRESHOLD_KRW &&
    COFFEE_KEYWORDS.some((k) => n.includes(k.toLowerCase()))
  ) {
    const homeSaving = amount - HOME_COFFEE_COST_KRW
    const brandSaving = amount - CHEAPER_BRAND_COST_KRW
    if (homeSaving > 0) {
      results.push({
        title: '집에서 커피 만들기',
        expectedCost: HOME_COFFEE_COST_KRW,
        savingAmount: homeSaving,
        savingPercent: amount > 0 ? Math.round((homeSaving / amount) * 100) : 0,
        reason: '원두나 캡슐로 집에서 마시면 월 수만 원 절감 가능',
      })
    }
    if (brandSaving > 0 && brandSaving !== homeSaving) {
      results.push({
        title: '저렴한 브랜드로 변경',
        expectedCost: CHEAPER_BRAND_COST_KRW,
        savingAmount: brandSaving,
        savingPercent: amount > 0 ? Math.round((brandSaving / amount) * 100) : 0,
        reason: '메가커피, 컴포즈 등 저렴한 브랜드 활용',
      })
    }
  }

  // Rule: Subscription
  if (category === 'subscription' && amount > 0) {
    results.push({
      title: '미사용 구독 해지',
      expectedCost: 0,
      savingAmount: amount,
      savingPercent: 100,
      reason: '실제 사용 여부를 점검하고 미사용 항목은 해지',
    })
  }

  // Rule: Shopping
  if (
    amount > 0 &&
    (SHOPPING_KEYWORDS.some((k) => n.includes(k.toLowerCase())) || category === 'other')
  ) {
    results.push({
      title: '구매 24시간 유예',
      expectedCost: 0,
      savingAmount: amount,
      savingPercent: 100,
      reason: '충동 구매 방지. 24시간 후에도 필요하면 구매',
    })
    const secondHandCost = Math.round(amount * 0.5)
    const secondHandSaving = amount - secondHandCost
    if (secondHandSaving > 0) {
      results.push({
        title: '중고·리퍼 탐색',
        expectedCost: secondHandCost,
        savingAmount: secondHandSaving,
        savingPercent: 50,
        reason: '중고 거래나 리퍼 상품으로 비용 절감',
      })
    }
  }

  return results
}

/**
 * AI fallback placeholder. Do not implement.
 * Replace with actual aiGenerateAlternatives(expense) when API is available.
 */
async function aiGenerateAlternativesPlaceholder(_expense: ExpenseItem): Promise<AlternativeOption[]> {
  await Promise.resolve()
  return []
}
