import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NumberInput, SliderInput, Button, LanguageToggle, ExpenseCalculatorModal } from '../components'
import { useFinanceStore } from '../store/useFinanceStore'

const MAX_KRW = 50_000_000
const TARGET_MONTHS = [3, 6, 9, 12] as const
const INCOME_DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1)

export function StructurePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const structure = useFinanceStore((s) => s.structure)
  const setStructure = useFinanceStore((s) => s.setStructure)
  const saveStructureFromPage = useFinanceStore((s) => s.saveStructureFromPage)
  const computeAndSetScore = useFinanceStore((s) => s.computeAndSetScore)
  const resetAll = useFinanceStore((s) => s.resetAll)
  const fixedExpenseItems = useFinanceStore((s) => s.fixedExpenseItems)
  const variableExpenseItems = useFinanceStore((s) => s.variableExpenseItems)
  const setFixedExpenseItems = useFinanceStore((s) => s.setFixedExpenseItems)
  const setVariableExpenseItems = useFinanceStore((s) => s.setVariableExpenseItems)

  const [calcModal, setCalcModal] = useState<'fixed' | 'variable' | null>(null)

  const update = (partial: Parameters<typeof setStructure>[0]) => {
    setStructure(partial)
    computeAndSetScore()
  }

  const handleApply = () => {
    saveStructureFromPage(structure)
    navigate('/')
  }

  const handleReset = () => {
    resetAll()
    computeAndSetScore()
  }

  const handleApplyFromCalc = (type: 'fixed' | 'variable') => {
    const items = type === 'fixed' ? fixedExpenseItems : variableExpenseItems
    const sum = items.reduce((a, i) => a + (Number.isFinite(i.amountKRW) ? Math.max(0, i.amountKRW) : 0), 0)
    setStructure({ [type === 'fixed' ? 'fixedExpenses' : 'variableExpenses']: sum })
    computeAndSetScore()
  }

  const incomeDay = Math.max(1, Math.min(31, structure.incomeDay ?? 25))

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E6EAF0]">
      <div className="max-w-xl mx-auto px-6 py-10 space-y-8">
        <h1 className="text-xl text-[#AAB2C0]">{t('structure.title')}</h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <NumberInput
              label={t('fields.lowestIncome')}
              value={structure.lowestIncome}
              onChange={(v) => update({ lowestIncome: v })}
              max={MAX_KRW}
            />
            <p className="text-xs text-[#8B9298]">{t('fields.lowestIncomeHelper')}</p>
            <SliderInput
              value={structure.lowestIncome}
              onChange={(v) => update({ lowestIncome: v })}
              max={MAX_KRW}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#AAB2C0]">{t('fields.fixedExpenses')}</span>
              <button
                type="button"
                onClick={() => setCalcModal('fixed')}
                className="rounded px-1.5 py-0.5 text-xs text-[#8B9298] hover:text-[#4C8BF5] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
                aria-label={t('expenseCalc.titleFixed')}
              >
                [!]
              </button>
            </div>
            <NumberInput
              value={structure.fixedExpenses}
              onChange={(v) => update({ fixedExpenses: v })}
              max={MAX_KRW}
            />
            <p className="text-xs text-[#8B9298]">{t('fields.fixedExpensesHelper')}</p>
            <SliderInput
              value={structure.fixedExpenses}
              onChange={(v) => update({ fixedExpenses: v })}
              max={MAX_KRW}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#AAB2C0]">{t('fields.variableExpenses')}</span>
              <button
                type="button"
                onClick={() => setCalcModal('variable')}
                className="rounded px-1.5 py-0.5 text-xs text-[#8B9298] hover:text-[#4C8BF5] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
                aria-label={t('expenseCalc.titleVariable')}
              >
                [!]
              </button>
            </div>
            <NumberInput
              value={structure.variableExpenses ?? 0}
              onChange={(v) => update({ variableExpenses: v })}
              max={MAX_KRW}
            />
            <p className="text-xs text-[#8B9298]">{t('fields.variableExpensesHelper')}</p>
            <SliderInput
              value={structure.variableExpenses ?? 0}
              onChange={(v) => update({ variableExpenses: v })}
              max={MAX_KRW}
            />
          </div>

          <div className="space-y-2">
            <NumberInput
              label={t('fields.emergencyFund')}
              value={structure.emergencyFund}
              onChange={(v) => update({ emergencyFund: v })}
              max={MAX_KRW}
            />
            <p className="text-xs text-[#8B9298]">{t('fields.emergencyFundHelper')}</p>
            <SliderInput
              value={structure.emergencyFund}
              onChange={(v) => update({ emergencyFund: v })}
              max={MAX_KRW}
            />
          </div>

          <div>
            <label className="block text-sm text-[#AAB2C0] mb-2">{t('fields.targetMonths')}</label>
            <p className="text-xs text-[#8B9298] mb-2">{t('fields.targetMonthsHelper')}</p>
            <div className="flex gap-2 flex-wrap">
              {TARGET_MONTHS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => update({ targetMonths: m })}
                  className={`rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50 ${
                    structure.targetMonths === m
                      ? 'bg-[#4C8BF5] text-[#E6EAF0]'
                      : 'bg-[#161A21] text-[#AAB2C0] hover:text-[#E6EAF0]'
                  }`}
                >
                  {t('fields.monthsUnit', { count: m })}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#AAB2C0] mb-2">{t('fields.incomeDay')}</label>
            <p className="text-xs text-[#8B9298] mb-2">{t('fields.incomeDayHelper')}</p>
            <select
              value={incomeDay}
              onChange={(e) => update({ incomeDay: parseInt(e.target.value, 10) })}
              className="rounded-lg border border-[#161A21] bg-[#161A21] px-3 py-2 text-sm text-[#E6EAF0] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
            >
              {INCOME_DAY_OPTIONS.map((d) => (
                <option key={d} value={d} className="bg-[#161A21]">
                  {t('fields.dayUnit', { n: d })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4">
          <Button variant="primary" onClick={handleApply}>
            {t('actions.applyChanges')}
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            {t('actions.resetAll')}
          </Button>
        </div>
        <footer className="pt-8 flex justify-end">
          <LanguageToggle />
        </footer>
      </div>

      <ExpenseCalculatorModal
        isOpen={calcModal === 'fixed'}
        title={t('expenseCalc.titleFixed')}
        items={fixedExpenseItems}
        onChangeItems={setFixedExpenseItems}
        onApply={() => handleApplyFromCalc('fixed')}
        onClose={() => setCalcModal(null)}
      />
      <ExpenseCalculatorModal
        isOpen={calcModal === 'variable'}
        title={t('expenseCalc.titleVariable')}
        items={variableExpenseItems}
        onChangeItems={setVariableExpenseItems}
        onApply={() => handleApplyFromCalc('variable')}
        onClose={() => setCalcModal(null)}
      />
    </div>
  )
}
