import { useTranslation } from 'react-i18next'
import type { StrategyOption } from '../utils/strategyEngine'
import { Button } from './Button'

export type StrategyCardProps = {
  option: StrategyOption
  onApply?: () => void
  className?: string
}

export function StrategyCard({ option, onApply, className = '' }: StrategyCardProps) {
  const { t } = useTranslation()
  const titleKey = `strategy.${option.id.toLowerCase()}Title` as const
  const subKey = `strategy.${option.id.toLowerCase()}Sub` as const
  const explanationKey = `strategy.${option.id.toLowerCase()}Explanation` as const

  const params: Record<string, string | number> = {
    reduction: option.expenseReductionManwon,
    runwayDelta: option.runwayDelta,
    progressBefore: option.progressBefore.toFixed(1),
    progressAfter: option.progressAfter.toFixed(1),
  }

  return (
    <div className={`rounded-xl bg-[#161A21] p-5 ${className}`}>
      <h3 className="text-[#E6EAF0] font-medium mb-1">
        {t(titleKey)}
      </h3>
      <p className="text-sm text-[#AAB2C0] mb-2">
        {t(subKey, params)}
      </p>
      <div className="text-sm text-[#8B9298] whitespace-pre-line mb-4">
        {t(explanationKey, params)}
      </div>
      {onApply && (
        <Button variant="primary" onClick={onApply}>
          {t('actions.applyScenario')}
        </Button>
      )}
    </div>
  )
}
