import type { StructureInput } from '../types/finance'

/** 유한한 수가 아니면 defaultVal 반환 */
function safeNum(value: number, defaultVal: number = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return defaultVal
  return value
}

/** 0 이상으로 클램프 (NaN/Infinity 방어) */
function clampNonNegative(value: number): number {
  return Math.max(0, safeNum(value, 0))
}

/** 구조 입력 정규화: NaN/Infinity/음수 방어, targetMonths/incomeDay 유효값만 */
function sanitizeStructure(s: StructureInput): StructureInput {
  const validMonths = [3, 6, 9, 12] as const
  const targetMonths = validMonths.includes(s.targetMonths) ? s.targetMonths : 6
  const incomeDay = typeof s.incomeDay === 'number' && Number.isFinite(s.incomeDay)
    ? Math.max(1, Math.min(31, Math.round(s.incomeDay)))
    : 25
  return {
    lowestIncome: clampNonNegative(s.lowestIncome),
    fixedExpenses: clampNonNegative(s.fixedExpenses),
    variableExpenses: clampNonNegative(s.variableExpenses ?? 0),
    emergencyFund: clampNonNegative(s.emergencyFund),
    targetMonths,
    incomeDay,
  }
}

/** min ~ max 사이로 값을 제한 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** 필요 자금 = 고정지출 × 목표 개월 */
export function getRequiredFund(fixedExpenses: number, targetMonths: number): number {
  return fixedExpenses * targetMonths
}

/** 진행률 = 비상자금 / 필요자금 (필요자금≤0이면 0) */
export function getProgressRatio(emergencyFund: number, requiredFund: number): number {
  if (requiredFund <= 0) return 0
  return emergencyFund / requiredFund
}

/** 지출비율 = 고정지출 / 최저소득 (최저소득≤0이면 1) */
export function getExpenseRatio(fixedExpenses: number, lowestIncome: number): number {
  if (lowestIncome <= 0) return 1
  return fixedExpenses / lowestIncome
}

/** 런웨이 개월 = 비상자금 / 고정지출 (고정지출≤0이면 0) */
export function getRunwayMonths(emergencyFund: number, fixedExpenses: number): number {
  if (fixedExpenses <= 0) return 0
  return emergencyFund / fixedExpenses
}

/** 런웨이 비율 = runwayMonths / targetMonths */
export function getRunwayRatio(runwayMonths: number, targetMonths: number): number {
  if (targetMonths <= 0) return 0
  return runwayMonths / targetMonths
}

/** 목표 달성까지 필요한 개월 수 = (필요자금 - 비상금) / 월 흑자. 흑자≤0 또는 이미 달성이면 null */
export function getMonthsToTarget(
  emergencyFund: number,
  requiredFund: number,
  monthlySurplus: number
): number | null {
  const gap = requiredFund - emergencyFund
  if (gap <= 0) return null
  if (!Number.isFinite(monthlySurplus) || monthlySurplus <= 0) return null
  const months = gap / monthlySurplus
  return Number.isFinite(months) ? months : null
}

/**
 * 구조 입력으로부터 PACE 점수(0~100) 계산 (보수적 공식).
 * progressComponent: 진행률^0.6 × 40
 * stabilityComponent: (1 - expenseRatio) 클램프 × 40
 * resilienceComponent: runwayMonths < 3 이면 (runwayMonths/3) 클램프 × 15, else runwayRatio 클램프 × 25
 */
export function computeScore(structure: StructureInput): number {
  const s = sanitizeStructure(structure)
  const requiredFund = getRequiredFund(s.fixedExpenses, s.targetMonths)
  const progressRatio = getProgressRatio(s.emergencyFund, requiredFund)
  const expenseRatio = getExpenseRatio(s.fixedExpenses, s.lowestIncome)
  const runwayMonths = getRunwayMonths(s.emergencyFund, s.fixedExpenses)
  const runwayRatio = getRunwayRatio(runwayMonths, s.targetMonths)

  const progressComponent = Math.pow(clamp(progressRatio, 0, 1), 0.6) * 40
  const stabilityComponent = clamp(1 - expenseRatio, 0, 1) * 40

  let resilienceComponent: number
  if (runwayMonths < 3) {
    resilienceComponent = clamp(runwayMonths / 3, 0, 1) * 15
  } else {
    resilienceComponent = clamp(runwayRatio, 0, 1) * 25
  }

  const rawScore = progressComponent + stabilityComponent + resilienceComponent
  return Math.round(clamp(rawScore, 0, 100))
}

export type Level = 'Preparation' | 'Building' | 'Stable' | 'Strategic'

/** 점수 구간에 따른 레벨: 0-39 Preparation, 40-69 Building, 70-84 Stable, 85-100 Strategic */
export function getLevel(score: number): Level {
  if (!Number.isFinite(score)) return 'Preparation'
  if (score >= 85) return 'Strategic'
  if (score >= 70) return 'Stable'
  if (score >= 40) return 'Building'
  return 'Preparation'
}

const LEVEL_MESSAGES: Record<Level, string> = {
  Preparation: 'Your structure needs reinforcement.',
  Building: 'You are strengthening your structure.',
  Stable: 'Your structure allows choice.',
  Strategic: 'You have operational freedom.',
}

export function getLevelMessage(level: Level): string {
  return LEVEL_MESSAGES[level]
}

/** Grade-based system (advisory mode): 0-39, 40-59, 60-74, 75-89, 90-100 */
export type Grade = 'preparation' | 'forming' | 'stable' | 'strategic' | 'autonomy'

/** 점수 구간에 따른 등급: 0-39 정비, 40-59 안정 형성, 60-74 안정 구간, 75-89 전략 구간, 90-100 자율 구간 */
export function getGrade(score: number): Grade {
  if (!Number.isFinite(score)) return 'preparation'
  if (score >= 90) return 'autonomy'
  if (score >= 75) return 'strategic'
  if (score >= 60) return 'stable'
  if (score >= 40) return 'forming'
  return 'preparation'
}

export type ComputeAllResult = {
  score: number
  level: Level
  message: string
  grade: Grade
  runwayMonths: number
  requiredFund: number
  progressPercent: number
  /** fixed + variable (for display) */
  totalExpenses: number
}

/** 구조 한 번에 계산: 점수, 레벨, 메시지, runwayMonths, requiredFund, progressPercent, totalExpenses */
export function computeAll(structure: StructureInput): ComputeAllResult {
  const s = sanitizeStructure(structure)
  const totalExpenses = s.fixedExpenses + s.variableExpenses
  const requiredFund = getRequiredFund(s.fixedExpenses, s.targetMonths)
  const progressRatio = getProgressRatio(s.emergencyFund, requiredFund)
  const runwayMonths = getRunwayMonths(s.emergencyFund, s.fixedExpenses)

  const score = computeScore(s)
  const level = getLevel(score)
  const message = getLevelMessage(level)
  const grade = getGrade(score)

  return {
    score: Number.isFinite(score) ? score : 0,
    level,
    message,
    grade,
    runwayMonths: Number.isFinite(runwayMonths) ? runwayMonths : 0,
    requiredFund: Number.isFinite(requiredFund) ? requiredFund : 0,
    progressPercent: Number.isFinite(progressRatio) ? progressRatio * 100 : 0,
    totalExpenses: Number.isFinite(totalExpenses) ? totalExpenses : 0,
  }
}

/** 개발용: 5가지 극단 케이스로 NaN/Infinity 없이 합리적 구간인지 검증 */
export function runSanityChecks(): void {
  const baseStruct = (o: Partial<StructureInput>): StructureInput => ({
    lowestIncome: 0,
    fixedExpenses: 0,
    variableExpenses: 0,
    emergencyFund: 0,
    targetMonths: 6,
    incomeDay: 25,
    ...o,
  })
  const cases: Array<{ name: string; structure: StructureInput; expectedScoreRange: [number, number] }> = [
    { name: '전부 0', structure: baseStruct({}), expectedScoreRange: [0, 40] },
    { name: '고정지출만 있음 (소득 없음)', structure: baseStruct({ fixedExpenses: 100 }), expectedScoreRange: [0, 40] },
    { name: '목표 달성 (충분한 비상자금, 낮은 지출비율)', structure: baseStruct({ lowestIncome: 500, fixedExpenses: 100, emergencyFund: 600 }), expectedScoreRange: [60, 100] },
    { name: '극단적 양호 (높은 소득, 낮은 지출, 비상자금 충분)', structure: baseStruct({ lowestIncome: 1000, fixedExpenses: 200, emergencyFund: 2400, targetMonths: 12 }), expectedScoreRange: [70, 100] },
    { name: '지출비율 100% (소득=지출)', structure: baseStruct({ lowestIncome: 300, fixedExpenses: 300 }), expectedScoreRange: [0, 40] },
  ]

  console.log('[PACE] Sanity checks (5 extreme cases)')
  let hasError = false
  for (const c of cases) {
    const result = computeAll(c.structure)
    const valid = Number.isFinite(result.score) && !Number.isNaN(result.score)
    const inRange = result.score >= c.expectedScoreRange[0] && result.score <= c.expectedScoreRange[1]
    if (!valid || !inRange) hasError = true
    console.log(`  ${c.name}: score=${result.score}, level=${result.level}, runwayMonths=${result.runwayMonths.toFixed(2)}, progressPercent=${result.progressPercent.toFixed(1)}% [expected ${c.expectedScoreRange[0]}-${c.expectedScoreRange[1]}] ${valid && inRange ? '✓' : '✗'}`)
  }
  console.log(hasError ? '[PACE] Some checks failed.' : '[PACE] All sanity checks passed (no NaN/Infinity).')
}
