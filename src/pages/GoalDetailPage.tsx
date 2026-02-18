import { useParams, useNavigate } from 'react-router-dom'
import { useSavingsStore } from '../store/savingsStore'
import { formatKRW } from '../utils/format'
import { getGoalMotivationMessage } from '../services/MotivationService'
import { Button } from '../components'

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const goals = useSavingsStore((s) => s.goals)
  const entries = useSavingsStore((s) => s.entries)

  const goal = goals.find((g) => g.id === id)
  const contributingEntries = goal
    ? entries.filter((e) => e.goalId === goal.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : []

  if (!goal) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8B9298] mb-4">목표를 찾을 수 없어요</p>
          <Button onClick={() => navigate('/dashboard')}>대시보드로</Button>
        </div>
      </div>
    )
  }

  const isCompleted = !!goal.completedAt || goal.progressPercent >= 100
  const motivation = getGoalMotivationMessage(goal)

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E6EAF0]">
      <div className="max-w-md mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-[#AAB2C0] hover:text-[#E6EAF0]"
          >
            ← 돌아가기
          </button>
          <h1 className="text-xl font-semibold truncate max-w-[200px]">{goal.title}</h1>
          <span className="w-20" />
        </header>

        <section className="rounded-2xl bg-[#161A21] border border-[#161A21] p-6">
          {isCompleted ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-xl font-bold text-[#2ECC71]">목표 달성!</p>
            </div>
          ) : (
            <>
              <p className="text-3xl md:text-4xl font-bold text-[#E6EAF0] mb-1">
                {formatKRW(goal.currentAmount)} <span className="text-[#8B9298]">/</span>{' '}
                {formatKRW(goal.targetAmount)}
              </p>
              <p className="text-2xl font-bold text-[#4C8BF5] mb-4">
                {goal.progressPercent}%
              </p>
              <div className="h-3 rounded-full bg-[#0F1115] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4C8BF5] to-[#2ECC71] transition-all"
                  style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                />
              </div>
            </>
          )}
          <p className="text-[#AAB2C0] mt-4 text-center">{motivation}</p>
        </section>

        <section>
          <h2 className="text-base font-medium text-[#E6EAF0] mb-4">
            이 목표에 기여한 저축
          </h2>
          {contributingEntries.length === 0 ? (
            <p className="text-[#8B9298] text-center py-8">
              아직 이 목표로 저축한 내역이 없어요
            </p>
          ) : (
            <ul className="space-y-2">
              {contributingEntries.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-xl bg-[#161A21] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-[#E6EAF0]">{e.title}</p>
                    <p className="text-xs text-[#8B9298]">
                      {new Date(e.createdAt).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-[#2ECC71]">
                    +{formatKRW(e.savedAmount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Button variant="primary" className="w-full" onClick={() => navigate('/add')}>
          저축 추가하기
        </Button>
      </div>
    </div>
  )
}
