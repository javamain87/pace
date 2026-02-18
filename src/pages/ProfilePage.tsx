import { useNavigate } from 'react-router-dom'
import { useSavingsStore } from '../store/savingsStore'
import { formatKRW } from '../utils/format'
import { getRankTitle } from '../types/Game'
import { Button } from '../components'

export function ProfilePage() {
  const navigate = useNavigate()
  const game = useSavingsStore((s) => s.game)
  const stats = useSavingsStore((s) => s.stats)
  const getLevelProgress = useSavingsStore((s) => s.getLevelProgress)

  const progress = getLevelProgress()

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
          <h1 className="text-xl font-semibold">프로필</h1>
          <span className="w-20" />
        </header>

        <section className="rounded-2xl bg-[#161A21] border border-[#161A21] p-6 text-center">
          <p className="text-6xl font-bold text-[#4C8BF5] mb-2">Lv.{game.level}</p>
          <p className="text-lg font-medium text-[#AAB2C0] mb-4">
            {getRankTitle(game.level)}
          </p>
          <p className="text-sm text-[#8B9298] mb-2">
            XP: {progress.current} / {progress.next}
          </p>
          <div className="h-3 rounded-full bg-[#0F1115] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4C8BF5] to-[#2ECC71] transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="rounded-xl bg-[#161A21] p-4 flex items-center justify-between">
            <span className="text-[#AAB2C0]">총 XP</span>
            <span className="text-xl font-bold text-[#E6EAF0]">{game.xp} XP</span>
          </div>
          <div className="rounded-xl bg-[#161A21] p-4 flex items-center justify-between">
            <span className="text-[#AAB2C0]">현재 연속</span>
            <span className="text-xl font-bold text-[#F5B041]">
              🔥 {game.streakDays}일
            </span>
          </div>
          <div className="rounded-xl bg-[#161A21] p-4 flex items-center justify-between">
            <span className="text-[#AAB2C0]">최장 연속</span>
            <span className="text-xl font-bold text-[#F5B041]">
              {game.longestStreak}일
            </span>
          </div>
          <div className="rounded-xl bg-[#161A21] p-4 flex items-center justify-between">
            <span className="text-[#AAB2C0]">총 저축액</span>
            <span className="text-xl font-bold text-[#2ECC71]">
              {formatKRW(stats.totalSaved)}
            </span>
          </div>
        </section>

        <Button variant="primary" className="w-full" onClick={() => navigate('/add')}>
          저축 추가하기
        </Button>
      </div>
    </div>
  )
}
