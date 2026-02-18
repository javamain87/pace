import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StructureInput, Cycle, ExpenseItem, ExpenseCategory, AdjustableLevel, RecommendationStatus, DecisionOutput } from '../types/finance'
import { getMonthlyRecommendation } from '../utils/decisionEngine'
import { evaluateExpenseDetailed } from '../utils/expenseDecisionEngine'

function createEmptyItem(rawText?: string): ExpenseItem {
  return {
    id: crypto.randomUUID(),
    name: rawText ?? '',
    amountKRW: 0,
    category: 'other',
    adjustableLevel: 'possible',
    createdAt: new Date().toISOString(),
    ...(rawText && { rawText }),
  }
}

const defaultExpenseItems = (): ExpenseItem[] =>
  [createEmptyItem(), createEmptyItem(), createEmptyItem()]
import { computeScore } from '../utils/calculations'

const defaultStructure: StructureInput = {
  lowestIncome: 0,
  fixedExpenses: 0,
  variableExpenses: 0,
  emergencyFund: 0,
  targetMonths: 6,
  incomeDay: 25,
}

type FinanceState = {
  structure: StructureInput
  /** Strategy simulations use this. Updated only when user saves from Structure page. */
  baseStructure: StructureInput
  cycles: Cycle[]
  lastScore: number
  lastScoreDelta: number
  hasStructure: boolean
  fixedExpenseItems: ExpenseItem[]
  variableExpenseItems: ExpenseItem[]
  /** ExpenseId -> DecisionOutput (alternatives when score < 70). Not persisted. */
  selectedExpenseAlternatives: Record<string, DecisionOutput>
  /** persist 제외: 최초 1회 계산 시 delta 0 처리용 */
  _hasComputedScore: boolean
}

type FinanceActions = {
  setStructure: (partial: Partial<StructureInput>) => void
  /** Save from Structure page: updates structure + baseStructure. Strategies simulate from baseStructure. */
  saveStructureFromPage: (structure: StructureInput) => void
  /** Save from Strategy apply: replaces structure only (no stacking). baseStructure unchanged. */
  saveStructure: (structure: StructureInput) => void
  setFixedExpenseItems: (items: ExpenseItem[]) => void
  setVariableExpenseItems: (items: ExpenseItem[]) => void
  addFixedExpenseItem: (rawText?: string) => void
  addVariableExpenseItem: (rawText?: string) => void
  generateAlternativesForExpense: (expenseId: string) => Promise<void>
  clearExpenseAlternatives: (expenseId?: string) => void
  setScore: (score: number) => void
  setScoreDelta: (delta: number) => void
  computeAndSetScore: () => void
  startNewCycle: () => void
  updateCurrentCycleRecommendationStatus: (status: RecommendationStatus) => void
  setCurrentCycleRecommendedActionId: (actionId: string) => void
  resetAll: () => void
}

const initialState: FinanceState = {
  structure: defaultStructure,
  baseStructure: defaultStructure,
  cycles: [],
  lastScore: 0,
  lastScoreDelta: 0,
  hasStructure: false,
  fixedExpenseItems: defaultExpenseItems(),
  variableExpenseItems: defaultExpenseItems(),
  selectedExpenseAlternatives: {},
  _hasComputedScore: false,
}

export const useFinanceStore = create<FinanceState & FinanceActions>()(
  persist(
    (set) => ({
      ...initialState,

      setStructure: (partial) =>
        set((state) => ({
          structure: { ...state.structure, ...partial },
        })),

      saveStructureFromPage: (structure) =>
        set({
          structure,
          baseStructure: { ...structure },
          hasStructure: true,
        }),

      saveStructure: (structure) =>
        set({
          structure,
          hasStructure: true,
        }),

      setFixedExpenseItems: (items) =>
        set({ fixedExpenseItems: items }),

      setVariableExpenseItems: (items) =>
        set({ variableExpenseItems: items }),

      addFixedExpenseItem: (rawText) =>
        set((state) => ({
          fixedExpenseItems: [...state.fixedExpenseItems, createEmptyItem(rawText)],
        })),

      addVariableExpenseItem: (rawText) =>
        set((state) => ({
          variableExpenseItems: [...state.variableExpenseItems, createEmptyItem(rawText)],
        })),

      generateAlternativesForExpense: async (expenseId) => {
        const state = useFinanceStore.getState()
        const allItems = [...state.fixedExpenseItems, ...state.variableExpenseItems]
        const expense = allItems.find((it) => it.id === expenseId)
        if (!expense) return
        const output = await evaluateExpenseDetailed(expense)
        set((s) => ({
          selectedExpenseAlternatives: { ...s.selectedExpenseAlternatives, [expenseId]: output },
        }))
      },

      clearExpenseAlternatives: (expenseId) =>
        set((state) => {
          if (expenseId) {
            const next = { ...state.selectedExpenseAlternatives }
            delete next[expenseId]
            return { selectedExpenseAlternatives: next }
          }
          return { selectedExpenseAlternatives: {} }
        }),

      setScore: (score) =>
        set({
          lastScore: score,
        }),

      setScoreDelta: (delta) =>
        set({
          lastScoreDelta: delta,
        }),

      computeAndSetScore: () =>
        set((state) => {
          const newScore = computeScore(state.structure)
          const isFirstCompute = !state._hasComputedScore
          const delta = isFirstCompute ? 0 : newScore - state.lastScore
          return {
            lastScore: newScore,
            lastScoreDelta: Math.round(delta) as number,
            _hasComputedScore: true,
          }
        }),

      startNewCycle: () =>
        set((state) => {
          const rec = getMonthlyRecommendation(
            state.structure,
            state.fixedExpenseItems,
            state.variableExpenseItems
          )
          const cycle: Cycle = {
            id: crypto.randomUUID(),
            startedAtISO: new Date().toISOString(),
            snapshot: { ...state.structure },
            scoreAtStart: state.lastScore,
            recommendedActionId: rec.id,
            recommendationStatus: 'pending',
          }
          return {
            cycles: [...state.cycles, cycle],
          }
        }),

      updateCurrentCycleRecommendationStatus: (status) =>
        set((state) => {
          const cycles = [...state.cycles]
          const last = cycles[cycles.length - 1]
          if (!last) return state
          cycles[cycles.length - 1] = {
            ...last,
            recommendationStatus: status,
            recommendationUpdatedAtISO: new Date().toISOString(),
          }
          return { cycles }
        }),

      setCurrentCycleRecommendedActionId: (actionId) =>
        set((state) => {
          const cycles = [...state.cycles]
          const last = cycles[cycles.length - 1]
          if (!last) return state
          cycles[cycles.length - 1] = {
            ...last,
            recommendedActionId: actionId,
            recommendationStatus: 'pending',
            recommendationUpdatedAtISO: new Date().toISOString(),
          }
          return { cycles }
        }),

      resetAll: () =>
        set({
          ...initialState,
          structure: defaultStructure,
          baseStructure: defaultStructure,
          fixedExpenseItems: defaultExpenseItems(),
          variableExpenseItems: defaultExpenseItems(),
        }),
    }),
    {
      name: 'pace-finance-storage',
      partialize: (state) => ({
        structure: state.structure,
        baseStructure: state.baseStructure,
        cycles: state.cycles,
        lastScore: state.lastScore,
        lastScoreDelta: state.lastScoreDelta,
        hasStructure: state.hasStructure,
        fixedExpenseItems: state.fixedExpenseItems,
        variableExpenseItems: state.variableExpenseItems,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Record<string, unknown>
        const cur = current as FinanceState & FinanceActions
        const s = (p.structure ?? cur.structure) as Record<string, unknown>
        const structure: StructureInput = {
          lowestIncome: typeof s?.lowestIncome === 'number' ? s.lowestIncome : 0,
          fixedExpenses: typeof s?.fixedExpenses === 'number' ? s.fixedExpenses : 0,
          variableExpenses: typeof s?.variableExpenses === 'number' ? s.variableExpenses : 0,
          emergencyFund: typeof s?.emergencyFund === 'number' ? s.emergencyFund : 0,
          targetMonths: [3, 6, 9, 12].includes(Number(s?.targetMonths)) ? (s.targetMonths as 3 | 6 | 9 | 12) : 6,
          incomeDay: typeof s?.incomeDay === 'number' ? Math.max(1, Math.min(31, Math.round(s.incomeDay))) : 25,
        }
        const bs = (p.baseStructure ?? structure) as Record<string, unknown>
        const baseStructure: StructureInput = {
          lowestIncome: typeof bs?.lowestIncome === 'number' ? bs.lowestIncome : structure.lowestIncome,
          fixedExpenses: typeof bs?.fixedExpenses === 'number' ? bs.fixedExpenses : structure.fixedExpenses,
          variableExpenses: typeof bs?.variableExpenses === 'number' ? bs.variableExpenses : structure.variableExpenses,
          emergencyFund: typeof bs?.emergencyFund === 'number' ? bs.emergencyFund : structure.emergencyFund,
          targetMonths: [3, 6, 9, 12].includes(Number(bs?.targetMonths)) ? (bs.targetMonths as 3 | 6 | 9 | 12) : structure.targetMonths,
          incomeDay: typeof bs?.incomeDay === 'number' ? Math.max(1, Math.min(31, Math.round(bs.incomeDay))) : structure.incomeDay,
        }
        const validCategories: ExpenseCategory[] = ['housing', 'insurance', 'loan', 'subscription', 'utility', 'other']
        const validLevels: AdjustableLevel[] = ['impossible', 'possible', 'easy']
        const normItems = (raw: unknown): ExpenseItem[] => {
          if (!Array.isArray(raw)) return defaultExpenseItems()
          return raw.map((x) => {
            const o = x as Record<string, unknown>
            const amount = typeof o?.amountKRW === 'number' ? Math.max(0, o.amountKRW) : 0
            const cat = o?.category as string | undefined
            const catVal: ExpenseCategory = typeof cat === 'string' && validCategories.includes(cat as ExpenseCategory) ? (cat as ExpenseCategory) : 'other'
            const lvl = o?.adjustableLevel as string | undefined
            const lvlVal: AdjustableLevel = typeof lvl === 'string' && validLevels.includes(lvl as AdjustableLevel) ? (lvl as AdjustableLevel) : 'possible'
            return {
              id: typeof o?.id === 'string' ? o.id : crypto.randomUUID(),
              name: typeof o?.name === 'string' ? o.name : '',
              amountKRW: Number.isFinite(amount) ? amount : 0,
              category: catVal,
              adjustableLevel: lvlVal,
              rawText: typeof o?.rawText === 'string' ? o.rawText : undefined,
              confidence: typeof o?.confidence === 'number' && o.confidence >= 0 && o.confidence <= 1 ? o.confidence : undefined,
              createdAt: typeof o?.createdAt === 'string' ? o.createdAt : undefined,
              manuallyEdited: o?.manuallyEdited === true,
            }
          })
        }
        const fixedExpenseItems = normItems(p.fixedExpenseItems).length > 0
          ? normItems(p.fixedExpenseItems)
          : defaultExpenseItems()
        const variableExpenseItems = normItems(p.variableExpenseItems).length > 0
          ? normItems(p.variableExpenseItems)
          : defaultExpenseItems()
        const normSnapshot = (raw: unknown): StructureInput => {
          const r = (raw ?? {}) as Record<string, unknown>
          return {
            lowestIncome: typeof r?.lowestIncome === 'number' ? r.lowestIncome : 0,
            fixedExpenses: typeof r?.fixedExpenses === 'number' ? r.fixedExpenses : 0,
            variableExpenses: typeof r?.variableExpenses === 'number' ? r.variableExpenses : 0,
            emergencyFund: typeof r?.emergencyFund === 'number' ? r.emergencyFund : 0,
            targetMonths: [3, 6, 9, 12].includes(Number(r?.targetMonths)) ? (r.targetMonths as 3 | 6 | 9 | 12) : 6,
            incomeDay: typeof r?.incomeDay === 'number' ? Math.max(1, Math.min(31, Math.round(r.incomeDay))) : 25,
          }
        }
        const rawCycles = (p.cycles ?? []) as unknown[]
        const cycles: Cycle[] = rawCycles.map((c) => {
          const x = c as Record<string, unknown>
          const snap = normSnapshot(x?.snapshot ?? structure)
          return {
            id: typeof x?.id === 'string' ? x.id : crypto.randomUUID(),
            startedAtISO: typeof x?.startedAtISO === 'string' ? x.startedAtISO : new Date().toISOString(),
            snapshot: snap,
            scoreAtStart: typeof x?.scoreAtStart === 'number' ? x.scoreAtStart : 0,
            recommendedActionId: typeof x?.recommendedActionId === 'string'
              ? x.recommendedActionId
              : getMonthlyRecommendation(snap, fixedExpenseItems, variableExpenseItems).id,
            recommendationStatus: (x?.recommendationStatus === 'accepted' || x?.recommendationStatus === 'deferred')
              ? (x.recommendationStatus as RecommendationStatus)
              : 'pending',
            recommendationUpdatedAtISO: typeof x?.recommendationUpdatedAtISO === 'string'
              ? x.recommendationUpdatedAtISO
              : undefined,
          }
        })
        return {
          ...cur,
          ...(typeof p === 'object' && p !== null ? p : {}),
          structure,
          baseStructure,
          fixedExpenseItems,
          variableExpenseItems,
          cycles,
        } as FinanceState & FinanceActions
      },
    }
  )
)
