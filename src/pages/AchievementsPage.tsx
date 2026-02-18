import { useNavigate } from 'react-router-dom'
import { useSavingsStore } from '../store/savingsStore'
import { getAllAchievementsWithStatus } from '../services/AchievementService'
import { Button } from '../components'

export function AchievementsPage() {
  const navigate = useNavigate()
  const stats = useSavingsStore((s) => s.stats)
  const entries = useSavingsStore((s) => s.entries)

  const achievements = getAllAchievementsWithStatus(
    stats,
    entries.length,
    stats.streakDays
  )

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length

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
          <h1 className="text-xl font-semibold">업적</h1>
          <span className="w-20" />
        </header>

        <p className="text-center text-[#AAB2C0]">
          {unlockedCount} / {achievements.length} 달성
        </p>

        <ul className="space-y-4">
          {achievements.map((a) => (
            <li
              key={a.id}
              className={`rounded-xl border p-4 ${
                a.unlockedAt
                  ? 'bg-[#2ECC71]/10 border-[#2ECC71]/40'
                  : 'bg-[#161A21] border-[#161A21] opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`text-2xl ${a.unlockedAt ? '' : 'grayscale opacity-50'}`}
                >
                  {a.id === 'first-savings' && '🎯'}
                  {a.id === 'save-100k' && '💰'}
                  {a.id === 'streak-7' && '🔥'}
                  {a.id === 'streak-30' && '⭐'}
                </span>
                <div>
                  <p className="font-medium text-[#E6EAF0]">{a.title}</p>
                  <p className="text-sm text-[#8B9298]">{a.description}</p>
                  {a.unlockedAt && (
                    <p className="text-xs text-[#2ECC71] mt-2">
                      달성
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Button variant="primary" className="w-full" onClick={() => navigate('/dashboard')}>
          대시보드로
        </Button>
      </div>
    </div>
  )
}
