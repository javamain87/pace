import { useEffect, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExpenseItem, ExpenseCategory, AdjustableLevel } from '../types/finance'
import { formatKRWToManWon, parseManWonToKRW } from '../utils/format'
import { classifyExpense, mapCategoryTypeToExpense } from '../services/classifyExpense'
import { evaluateExpense } from '../utils/expenseDecisionEngine'
import { useFinanceStore } from '../store/useFinanceStore'
import { Button } from './Button'
import { ExpenseDetailPanel } from './ExpenseDetailPanel'

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['housing', 'insurance', 'loan', 'subscription', 'utility', 'other']
const ADJUSTABLE_LEVELS: AdjustableLevel[] = ['impossible', 'possible', 'easy']

export type ExpenseCalculatorModalProps = {
  isOpen: boolean
  title: string
  items: ExpenseItem[]
  onChangeItems: (items: ExpenseItem[]) => void
  onApply: () => void
  onClose: () => void
}

function safeAmount(val: string | number): number {
  const n = typeof val === 'number' ? val : parseManWonToKRW(val)
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

const CLASSIFY_DEBOUNCE_MS = 400

export function ExpenseCalculatorModal({
  isOpen,
  title,
  items,
  onChangeItems,
  onApply,
  onClose,
}: ExpenseCalculatorModalProps) {
  const { t } = useTranslation()
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null)
  const [loadingExpenseId, setLoadingExpenseId] = useState<string | null>(null)
  const selectedExpenseAlternatives = useFinanceStore((s) => s.selectedExpenseAlternatives)
  const generateAlternativesForExpense = useFinanceStore((s) => s.generateAlternativesForExpense)
  const clearExpenseAlternatives = useFinanceStore((s) => s.clearExpenseAlternatives)
  const classifyTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const itemsRef = useRef(items)
  itemsRef.current = items

  const runClassify = useCallback(
    async (id: string, rawText: string) => {
      const currentItems = itemsRef.current
      const item = currentItems.find((it) => it.id === id)
      if (!item || item.manuallyEdited || !rawText.trim()) return
      const result = await classifyExpense(rawText.trim())
      const mapped = result.expenseCategory ?? mapCategoryTypeToExpense(result.category)
      const category = result.confidence >= 0.6 ? mapped : 'other'
      onChangeItems(
        currentItems.map((it) =>
          it.id === id
            ? {
                ...it,
                name: rawText.trim(),
                rawText: rawText.trim(),
                category,
                confidence: result.confidence,
                createdAt: it.createdAt ?? new Date().toISOString(),
              }
            : it
        )
      )
    },
    [onChangeItems]
  )

  const scheduleClassify = useCallback(
    (id: string, rawText: string) => {
      if (classifyTimersRef.current[id]) clearTimeout(classifyTimersRef.current[id])
      classifyTimersRef.current[id] = setTimeout(() => {
        runClassify(id, rawText)
        delete classifyTimersRef.current[id]
      }, CLASSIFY_DEBOUNCE_MS)
    },
    [runClassify]
  )

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
      Object.values(classifyTimersRef.current).forEach(clearTimeout)
      classifyTimersRef.current = {}
    }
  }, [isOpen, handleEscape])

  const updateItem = (id: string, patch: Partial<Pick<ExpenseItem, 'name' | 'amountKRW' | 'category' | 'adjustableLevel' | 'confidence' | 'rawText' | 'createdAt' | 'manuallyEdited'>>) => {
    onChangeItems(
      items.map((it) =>
        it.id === id
          ? {
              ...it,
              ...(patch.name !== undefined && { name: String(patch.name) }),
              ...(patch.amountKRW !== undefined && { amountKRW: safeAmount(patch.amountKRW) }),
              ...(patch.category !== undefined && { category: patch.category }),
              ...(patch.adjustableLevel !== undefined && { adjustableLevel: patch.adjustableLevel }),
              ...(patch.confidence !== undefined && { confidence: patch.confidence }),
              ...(patch.rawText !== undefined && { rawText: patch.rawText }),
              ...(patch.createdAt !== undefined && { createdAt: patch.createdAt }),
              ...(patch.manuallyEdited !== undefined && { manuallyEdited: patch.manuallyEdited }),
            }
          : it
      )
    )
  }

  const createNewItem = (): ExpenseItem => ({
    id: crypto.randomUUID(),
    name: '',
    amountKRW: 0,
    category: 'other',
    adjustableLevel: 'possible',
    createdAt: new Date().toISOString(),
  })

  const removeItem = (id: string) => {
    const next = items.filter((it) => it.id !== id)
    if (next.length === 0) {
      onChangeItems([createNewItem()])
    } else {
      onChangeItems(next)
    }
  }

  const addItem = () => {
    onChangeItems([...items, createNewItem()])
  }

  const sumKRW = items.reduce((acc, it) => acc + (Number.isFinite(it.amountKRW) ? Math.max(0, it.amountKRW) : 0), 0)
  const sumManwon = formatKRWToManWon(sumKRW)

  const handleApply = () => {
    onApply()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-calc-title"
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-auto rounded-xl bg-[#161A21] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="expense-calc-title" className="text-lg font-medium text-[#E6EAF0] mb-4">
          {title}
        </h2>

        <div className="space-y-3 mb-4 max-h-[50vh] overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 p-3 rounded-lg bg-[#0F1115]"
            >
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const newName = e.target.value
                    updateItem(item.id, { name: newName })
                    if (!item.manuallyEdited) scheduleClassify(item.id, newName)
                  }}
                  placeholder={t('expenseCalc.itemNamePlaceholder')}
                  className="flex-1 min-w-0 rounded-lg border border-[#161A21] bg-[#0F1115] px-3 py-2 text-sm text-[#E6EAF0] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
                />
                <span
                  className="shrink-0 px-2 py-1 rounded text-xs font-medium bg-[#161A21] text-[#AAB2C0]"
                  title={t(`expenseCalc.category.${item.category}`)}
                >
                  {t(`expenseCalc.category.${item.category}`)}
                </span>
                {typeof item.confidence === 'number' &&
                  item.confidence < 0.7 &&
                  !item.manuallyEdited && (
                    <Button
                      variant="ghost"
                      className="!py-1 !px-2 !text-xs"
                      onClick={() => {
                        updateItem(item.id, { manuallyEdited: false })
                        scheduleClassify(item.id, item.name)
                      }}
                    >
                      {t('expenseCalc.verify')}
                    </Button>
                  )}
                <select
                  value={item.category ?? 'other'}
                  onChange={(e) =>
                    updateItem(item.id, {
                      category: e.target.value as ExpenseCategory,
                      manuallyEdited: true,
                    })
                  }
                  className="rounded-lg border border-[#161A21] bg-[#0F1115] px-3 py-2 text-sm text-[#E6EAF0] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#161A21]">
                      {t(`expenseCalc.category.${c}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={formatKRWToManWon(item.amountKRW) || ''}
                  onChange={(e) =>
                    updateItem(item.id, {
                      amountKRW: parseManWonToKRW(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="w-20 rounded-lg border border-[#161A21] bg-[#0F1115] px-3 py-2 text-sm text-[#E6EAF0] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
                />
                <span className="text-sm text-[#AAB2C0] shrink-0">
                  {t('fields.manwon')}
                </span>
                <select
                  value={item.adjustableLevel ?? 'possible'}
                  onChange={(e) => updateItem(item.id, { adjustableLevel: e.target.value as AdjustableLevel })}
                  className="rounded-lg border border-[#161A21] bg-[#0F1115] px-3 py-2 text-sm text-[#E6EAF0] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
                >
                  {ADJUSTABLE_LEVELS.map((l) => (
                    <option key={l} value={l} className="bg-[#161A21]">
                      {t(`expenseCalc.adjustableLevel.${l}`)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg px-2 py-2 text-sm text-[#AAB2C0] hover:bg-[#161A21] hover:text-[#F5B041] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
                  aria-label={t('expenseCalc.delete')}
                >
                  {t('expenseCalc.delete')}
                </button>
                {evaluateExpense(item).score < 70 && (
                  <Button
                    variant="ghost"
                    className="!py-1 !px-2 !text-xs shrink-0"
                    onClick={() => {
                      const isExpanded = expandedExpenseId === item.id
                      if (isExpanded) {
                        setExpandedExpenseId(null)
                      } else {
                        setExpandedExpenseId(item.id)
                        if (!selectedExpenseAlternatives[item.id]) {
                          setLoadingExpenseId(item.id)
                          generateAlternativesForExpense(item.id).finally(() =>
                            setLoadingExpenseId(null)
                          )
                        }
                      }
                    }}
                  >
                    {expandedExpenseId === item.id
                      ? t('expenseDetail.hideAlternatives')
                      : t('expenseDetail.viewAlternatives')}
                  </Button>
                )}
              </div>
              {expandedExpenseId === item.id && (
                <ExpenseDetailPanel
                  expense={item}
                  decisionOutput={selectedExpenseAlternatives[item.id]}
                  isLoading={loadingExpenseId === item.id}
                  onLoadAlternatives={() => {
                    setLoadingExpenseId(item.id)
                    generateAlternativesForExpense(item.id).finally(() =>
                      setLoadingExpenseId(null)
                    )
                  }}
                  onChooseAlternative={(opt) => {
                    updateItem(item.id, { amountKRW: opt.expectedCost })
                    clearExpenseAlternatives(item.id)
                    setExpandedExpenseId(null)
                  }}
                  onClose={() => setExpandedExpenseId(null)}
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="w-full rounded-lg border border-dashed border-[#4C8BF5]/50 py-2 text-sm text-[#4C8BF5] hover:bg-[#4C8BF5]/10 focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50 mb-4"
        >
          {t('expenseCalc.addItem')}
        </button>

        <p className="text-sm font-medium text-[#E6EAF0] mb-4">
          {t('expenseCalc.sum')}: {sumManwon.toLocaleString()}{t('fields.manwon')}
        </p>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            {t('expenseCalc.close')}
          </Button>
          <Button variant="primary" onClick={handleApply}>
            {t('expenseCalc.apply')}
          </Button>
        </div>
      </div>
    </div>
  )
}
