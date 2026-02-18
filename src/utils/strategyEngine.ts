import type { StructureInput } from '../types/finance'
import { computeAll, getMonthsToTarget } from './calculations'

/** 만원 단위로 반올림 (예: 123456 → 120000) */
function roundToNearest10000(value: number): number {
  return Math.round(value / 10000) * 10000
}

export type StrategyId = 'A' | 'B' | 'C'

export type StrategyOption = {
  id: StrategyId
  title: string
  subtitle: string
  nextStructure: StructureInput
  scoreBefore: number
  scoreAfter: number
  delta: number
  runwayBefore: number
  runwayAfter: number
  progressBefore: number
  progressAfter: number
  /** 월 지출 감소액 (만원 단위, 전략 A/C) */
  expenseReductionManwon: number
  /** 현재 유지 가능한 기간 변화 (개월) */
  runwayDelta: number
  /** 목표 달성까지 개월 (현재 구조), null = N/A */
  monthsToTargetBefore: number | null
  /** 목표 달성까지 개월 (적용 후), null = N/A */
  monthsToTargetAfter: number | null
}

/** 구조에 variableExpenses, incomeDay가 없으면 기본값 채움 */
function normalizeStructure(s: StructureInput): StructureInput {
  return {
    ...s,
    variableExpenses: s.variableExpenses ?? 0,
    incomeDay: typeof s.incomeDay === 'number' ? Math.max(1, Math.min(31, Math.round(s.incomeDay))) : 25,
  }
}

/**
 * 현재 구조 기준으로 3가지 전략 시나리오 생성.
 * A: 고정비 10% 감소(만원 단위), B: 비상자금 +50만원, C: 고정비 5% 감소 + 비상자금 +30만원.
 */
export function generateStrategies(structure: StructureInput): StrategyOption[] {
  const s = normalizeStructure(structure)
  const before = computeAll(s)
  const totalExpBefore = s.fixedExpenses + s.variableExpenses
  const surplusBefore = Math.max(0, s.lowestIncome - totalExpBefore)

  const options: Array<{
    id: StrategyId
    title: string
    subtitle: string
    nextStructure: StructureInput
  }> = [
    {
      id: 'A',
      title: 'Expense Adjustment',
      subtitle: '고정지출 10% 절감 (만원 단위 반올림)',
      nextStructure: {
        ...s,
        fixedExpenses: roundToNearest10000(s.fixedExpenses * 0.9),
      },
    },
    {
      id: 'B',
      title: 'Savings Focus',
      subtitle: '비상자금 50만원 추가 가정',
      nextStructure: {
        ...s,
        emergencyFund: s.emergencyFund + 500000,
      },
    },
    {
      id: 'C',
      title: 'Hybrid',
      subtitle: '지출 5% 절감 + 비상자금 30만원 추가',
      nextStructure: {
        ...s,
        fixedExpenses: roundToNearest10000(s.fixedExpenses * 0.95),
        emergencyFund: s.emergencyFund + 300000,
      },
    },
  ]

  return options.map((opt) => {
    const after = computeAll(opt.nextStructure)
    const totalExpAfter = opt.nextStructure.fixedExpenses + (opt.nextStructure.variableExpenses ?? 0)
    const expenseReduction = Math.round((totalExpBefore - totalExpAfter) / 10000)
    const surplusAfter = Math.max(0, opt.nextStructure.lowestIncome - totalExpAfter)
    const monthsBefore = getMonthsToTarget(s.emergencyFund, before.requiredFund, surplusBefore)
    const monthsAfter = getMonthsToTarget(
      opt.nextStructure.emergencyFund,
      after.requiredFund,
      surplusAfter
    )
    return {
      id: opt.id,
      title: opt.title,
      subtitle: opt.subtitle,
      nextStructure: opt.nextStructure,
      scoreBefore: before.score,
      scoreAfter: after.score,
      delta: after.score - before.score,
      runwayBefore: before.runwayMonths,
      runwayAfter: after.runwayMonths,
      progressBefore: before.progressPercent,
      progressAfter: after.progressPercent,
      expenseReductionManwon: Math.max(0, expenseReduction),
      runwayDelta: Math.round((after.runwayMonths - before.runwayMonths) * 10) / 10,
      monthsToTargetBefore: monthsBefore !== null ? Math.round(monthsBefore * 10) / 10 : null,
      monthsToTargetAfter: monthsAfter !== null ? Math.round(monthsAfter * 10) / 10 : null,
    }
  })
}

/** 개발용: 고정 구조로 전략 3개 생성 후 콘솔 로그 (NaN/델타 검증) */
export function runStrategyEngineTest(): void {
  const structure: StructureInput = {
    lowestIncome: 500000,
    fixedExpenses: 300000,
    variableExpenses: 50000,
    emergencyFund: 600000,
    targetMonths: 6,
    incomeDay: 25,
  }
  console.log('[PACE] Strategy engine test', structure)
  const strategies = generateStrategies(structure)
  strategies.forEach((s) => {
    const valid =
      Number.isFinite(s.scoreAfter) &&
      Number.isFinite(s.runwayAfter) &&
      Number.isFinite(s.progressAfter)
    console.log(
      `  ${s.id} ${s.title}: score ${s.scoreBefore} → ${s.scoreAfter} (delta ${s.delta}), runway ${s.runwayBefore.toFixed(2)} → ${s.runwayAfter.toFixed(2)} mo, progress ${s.progressBefore.toFixed(1)}% → ${s.progressAfter.toFixed(1)}% ${valid ? '✓' : '✗'}`
    )
  })
}
