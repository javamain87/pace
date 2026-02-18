import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components'
import { useFinanceStore } from '../store/useFinanceStore'
import { computeAll } from '../utils/calculations'
import { formatKrWManwon } from '../utils/format'
import { getMonthlyRecommendation, getRecommendationById } from '../utils/decisionEngine'

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const structure = useFinanceStore((s) => s.structure)
  const fixedExpenseItems = useFinanceStore((s) => s.fixedExpenseItems)
  const variableExpenseItems = useFinanceStore((s) => s.variableExpenseItems)
  const hasStructure = useFinanceStore((s) => s.hasStructure)
  const lastScore = useFinanceStore((s) => s.lastScore)
  const lastScoreDelta = useFinanceStore((s) => s.lastScoreDelta)
  const cycles = useFinanceStore((s) => s.cycles)
  const startNewCycle = useFinanceStore((s) => s.startNewCycle)
  const updateCurrentCycleRecommendationStatus = useFinanceStore((s) => s.updateCurrentCycleRecommendationStatus)

  const needsRedirect = !hasStructure || structure.lowestIncome === 0

  useEffect(() => {
    if (needsRedirect) {
      navigate('/structure', { replace: true })
    }
  }, [needsRedirect, navigate])

  if (needsRedirect) return null

  const result = computeAll(structure)
  const incomeDay = Math.max(1, Math.min(31, structure.incomeDay ?? 25))
  const today = new Date().getDate()
  const canStartNewCycle = today >= incomeDay

  const currentCycle = cycles.length > 0 ? cycles[cycles.length - 1] : null
  const recContext = { structure, fixedExpenseItems, variableExpenseItems }
  const recommendation = currentCycle
    ? getRecommendationById(currentCycle.recommendedActionId, recContext)
    : getMonthlyRecommendation(structure, fixedExpenseItems, variableExpenseItems)

  const deltaColor =
    lastScoreDelta > 0
      ? 'text-[#2ECC71]'
      : lastScoreDelta < 0
        ? 'text-[#F5B041]'
        : 'text-[#AAB2C0]'
  const deltaText =
    lastScoreDelta > 0
      ? `+${lastScoreDelta}`
      : lastScoreDelta < 0
        ? String(lastScoreDelta)
        : ''

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E6EAF0]">
      <div className="max-w-xl mx-auto px-6 py-12 space-y-10">
        <section>
          <p className="text-sm text-[#8B9298] mb-1">
            {t('grade.statusLabel')}: {t(`grade.${result.grade}`)}
          </p>
          <p className="text-lg text-[#E6EAF0] mb-2">
            {t(`grade.msg.${result.grade}`)}
          </p>
          <p className="text-xs text-[#8B9298]">
            {t('grade.indicatorLabel')}: {result.score}
            {lastScoreDelta !== 0 && (
              <span className={`ml-1 ${deltaColor}`}>
                ({lastScore - lastScoreDelta} → {lastScore} {deltaText})
              </span>
            )}
          </p>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-[#8B9298] hover:text-[#AAB2C0]">
              {t('score.explanationTitle')}
            </summary>
            <div className="mt-2 text-sm text-[#8B9298] whitespace-pre-line">
              {t('score.explanationBody')}
            </div>
          </details>
        </section>

        <section className="rounded-xl bg-[#161A21] p-5 space-y-3 text-sm">
          <h2 className="text-base font-medium text-[#E6EAF0] mb-3">
            {t('cycle.recommendationSectionTitle')}
          </h2>
          <p className="font-medium text-[#E6EAF0]">{recommendation.title}</p>
          <p className="text-[#AAB2C0]">{recommendation.reason}</p>
          <p className="text-[#8B9298] text-xs">{recommendation.impactText}</p>
          <ul className="list-disc list-inside text-[#8B9298] text-xs space-y-1">
            {recommendation.checklist.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          {currentCycle?.recommendationStatus === 'pending' ? (
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="primary"
                onClick={() => updateCurrentCycleRecommendationStatus('accepted')}
              >
                {t('cycle.acceptRecommendation')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => updateCurrentCycleRecommendationStatus('deferred')}
              >
                {t('cycle.deferRecommendation')}
              </Button>
            </div>
          ) : currentCycle ? (
            <p className="text-xs text-[#8B9298] pt-2">
              {currentCycle.recommendationStatus === 'accepted'
                ? t('cycle.statusAccepted')
                : t('cycle.statusDeferred')}
            </p>
          ) : (
            <p className="text-xs text-[#8B9298] pt-2">
              {t('cycle.noCycleHint')}
            </p>
          )}
        </section>

        <section className="rounded-xl bg-[#161A21] p-5 space-y-3 text-sm text-[#AAB2C0]">
          <div>
            <p className="font-medium text-[#E6EAF0]">{t('fields.target')}: {formatKrWManwon(result.requiredFund)}</p>
            <p className="text-xs text-[#8B9298] mt-0.5">{t('fields.targetHelper')}</p>
          </div>
          <div>
            <p className="font-medium text-[#E6EAF0]">{t('fields.runway')}: {result.runwayMonths.toFixed(1)} months</p>
            <p className="text-xs text-[#8B9298] mt-0.5">{t('fields.runwayHelper')}</p>
          </div>
          <div>
            <p className="font-medium text-[#E6EAF0]">{t('fields.progress')}: {result.progressPercent.toFixed(1)}%</p>
            <p className="text-xs text-[#8B9298] mt-0.5">{t('fields.progressHelper')}</p>
          </div>
          {result.totalExpenses > 0 && (
            <div>
              <p className="font-medium text-[#E6EAF0]">{t('fields.totalExpenses')}: {formatKrWManwon(result.totalExpenses)}</p>
            </div>
          )}
        </section>

        <section className="space-y-2">
          <p className="text-xs text-[#8B9298]">{t('cycle.nextCycleOn', { day: incomeDay })}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('/strategy')}
              disabled={!currentCycle}
            >
              {t('alternative.viewAlternative')}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/structure')}>
              {t('actions.editStructure')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => startNewCycle()}
              disabled={!canStartNewCycle}
            >
              {t('actions.startNewCycle')}
            </Button>
          </div>
        </section>

        {import.meta.env.DEV && (
          <details className="rounded-xl bg-[#161A21] p-4 text-xs text-[#AAB2C0]">
            <summary className="cursor-pointer font-medium text-[#E6EAF0]">
              {t('debug.panel')}
            </summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap break-all">
              {JSON.stringify(
                {
                  structure: {
                    lowestIncome: structure.lowestIncome,
                    fixedExpenses: structure.fixedExpenses,
                    variableExpenses: structure.variableExpenses,
                    emergencyFund: structure.emergencyFund,
                    targetMonths: structure.targetMonths,
                    incomeDay: structure.incomeDay,
                  },
                  computed: {
                    score: result.score,
                    grade: result.grade,
                    runwayMonths: result.runwayMonths,
                    requiredFund: result.requiredFund,
                    totalExpenses: result.totalExpenses,
                    progressPercent: result.progressPercent,
                  },
                  store: {
                    lastScore,
                    lastScoreDelta,
                    hasStructure,
                  },
                },
                null,
                2
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
