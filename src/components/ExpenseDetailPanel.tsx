import { useTranslation } from 'react-i18next'
import type { ExpenseItem, AlternativeOption, DecisionOutput } from '../types/finance'
import { formatKrWManwon } from '../utils/format'
import { evaluateExpense } from '../utils/expenseDecisionEngine'
import { Button } from './Button'

export type ExpenseDetailPanelProps = {
  expense: ExpenseItem
  decisionOutput?: DecisionOutput | null
  isLoading?: boolean
  onLoadAlternatives: () => void
  onChooseAlternative: (option: AlternativeOption) => void
  onClose?: () => void
}

const STATUS_COLOR: Record<string, string> = {
  ALLOW: 'text-[#2ECC71]',
  WARN: 'text-[#F5B041]',
  BLOCK: 'text-[#E74C3C]',
}

export function ExpenseDetailPanel({
  expense,
  decisionOutput,
  isLoading,
  onLoadAlternatives,
  onChooseAlternative,
  onClose,
}: ExpenseDetailPanelProps) {
  const { t } = useTranslation()
  const decision = decisionOutput?.decision ?? evaluateExpense(expense)
  const alternatives = decisionOutput?.alternatives ?? []
  const showAlternativesSection = decision.score < 70
  const hasAlternatives = alternatives.length > 0

  return (
    <div className="rounded-lg border border-[#161A21] bg-[#0F1115]/80 p-3 mt-2 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#8B9298]">
          {t('expenseDetail.score')}: {decision.score}
          <span className={`ml-2 font-medium ${STATUS_COLOR[decision.status]}`}>
            {t(`expenseDetail.status.${decision.status}`)}
          </span>
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#8B9298] hover:text-[#AAB2C0]"
            aria-label={t('actions.back')}
          >
            ×
          </button>
        )}
      </div>

      {showAlternativesSection && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-[#AAB2C0]">
            {t('expenseDetail.alternativeOptions')}
          </h4>
          {isLoading && (
            <p className="text-xs text-[#8B9298]">{t('expenseDetail.loading')}</p>
          )}
          {!isLoading && !hasAlternatives && (
            <Button
              variant="ghost"
              className="!py-1 !px-2 !text-xs"
              onClick={onLoadAlternatives}
            >
              {t('expenseDetail.viewAlternatives')}
            </Button>
          )}
          {!isLoading && hasAlternatives && (
            <ul className="space-y-2">
              {alternatives.map((opt, i) => (
                <li
                  key={i}
                  className="flex flex-col gap-1 rounded border border-[#161A21] bg-[#161A21]/50 p-2 text-xs"
                >
                  <span className="font-medium text-[#E6EAF0]">{opt.title}</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[#8B9298]">
                    <span>
                      {t('expenseDetail.saving')}: {formatKrWManwon(opt.savingAmount)} ({opt.savingPercent}%)
                    </span>
                    <span>
                      {t('expenseDetail.expectedCost')}: {formatKrWManwon(opt.expectedCost)}
                    </span>
                  </div>
                  <p className="text-[#8B9298]">{opt.reason}</p>
                  <Button
                    variant="primary"
                    className="!py-1 !px-2 !text-xs mt-1 self-start"
                    onClick={() => onChooseAlternative(opt)}
                  >
                    {t('expenseDetail.chooseAlternative')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
