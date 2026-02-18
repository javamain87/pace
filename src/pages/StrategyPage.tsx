import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components'
import { useFinanceStore } from '../store/useFinanceStore'
import { getAlternativeActionId, getRecommendationById } from '../utils/decisionEngine'

export function StrategyPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const structure = useFinanceStore((s) => s.structure)
  const fixedExpenseItems = useFinanceStore((s) => s.fixedExpenseItems)
  const variableExpenseItems = useFinanceStore((s) => s.variableExpenseItems)
  const cycles = useFinanceStore((s) => s.cycles)
  const setCurrentCycleRecommendedActionId = useFinanceStore((s) => s.setCurrentCycleRecommendedActionId)

  const currentCycle = cycles.length > 0 ? cycles[cycles.length - 1] : null
  const recContext = { structure, fixedExpenseItems, variableExpenseItems }
  const alternativeId = currentCycle
    ? getAlternativeActionId(currentCycle.recommendedActionId, recContext)
    : null
  const alternative = alternativeId ? getRecommendationById(alternativeId, recContext) : null

  useEffect(() => {
    if (!currentCycle) {
      navigate('/', { replace: true })
    }
  }, [currentCycle, navigate])

  const handleSwitch = () => {
    if (alternativeId) {
      setCurrentCycleRecommendedActionId(alternativeId)
      navigate('/')
    }
  }

  if (!currentCycle || !alternative) return null

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E6EAF0]">
      <div className="max-w-xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl text-[#AAB2C0]">{t('alternative.title')}</h1>
          <Button variant="ghost" onClick={() => navigate('/')}>
            {t('actions.back')}
          </Button>
        </div>

        <section className="rounded-xl bg-[#161A21] p-5 space-y-3 text-sm">
          <p className="font-medium text-[#E6EAF0]">{alternative.title}</p>
          <p className="text-[#AAB2C0]">{alternative.reason}</p>
          <p className="text-[#8B9298] text-xs">{alternative.impactText}</p>
          <ul className="list-disc list-inside text-[#8B9298] text-xs space-y-1">
            {alternative.checklist.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <div className="pt-4">
            <Button variant="primary" onClick={handleSwitch}>
              {t('alternative.switchToThis')}
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
