import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSavingsStore } from '../store/savingsStore'
import { formatKRW } from '../utils/format'
import { getMotivationMessage } from '../utils/motivationMessages'
import { getUnlockedAchievements } from '../services/AchievementService'
import { getGoalMotivationMessage } from '../services/MotivationService'
import { getGameMotivationMessage } from '../services/GameMotivationService'
import { getQuestMotivationMessage } from '../services/QuestMotivationService'
import { getRankTitle } from '../types/Game'
import { Button } from '../components'
import { LevelUpModal } from '../components/LevelUpModal'
import { QuestCompleteModal } from '../components/QuestCompleteModal'

export function SavingsDashboardPage() {
  const navigate = useNavigate()
  const stats = useSavingsStore((s) => s.stats)
  const goals = useSavingsStore((s) => s.goals)
  const game = useSavingsStore((s) => s.game)
  const dailyQuests = useSavingsStore((s) => s.dailyQuests)
  const lastLevelUp = useSavingsStore((s) => s.lastLevelUp)
  const lastQuestCompleted = useSavingsStore((s) => s.lastQuestCompleted)
  const clearLevelUp = useSavingsStore((s) => s.clearLevelUp)
  const clearLastQuestCompleted = useSavingsStore((s) => s.clearLastQuestCompleted)
  const generateTodayQuests = useSavingsStore((s) => s.generateTodayQuests)
  const getRecentSavings = useSavingsStore((s) => s.getRecentSavings)
  const getLevelProgress = useSavingsStore((s) => s.getLevelProgress)
  const entries = useSavingsStore((s) => s.entries)

  useEffect(() => {
    generateTodayQuests()
  }, [generateTodayQuests])

  const levelProgress = getLevelProgress()
  const gameMotivation = getGameMotivationMessage(game)

  const recent = getRecentSavings(10)
  const motivation = getMotivationMessage(
    stats.totalSaved,
    stats.todaySaved,
    stats.monthlySaved
  )
  const unlockedCount = getUnlockedAchievements(
    stats,
    entries.length,
    stats.streakDays
  ).length

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E6EAF0]">
      <div className="max-w-xl mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#E6EAF0]">PACE</h1>
          <nav className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/quests')}>
              퀘스트
            </Button>
            <Button variant="ghost" onClick={() => navigate('/profile')}>
              프로필
            </Button>
            <Button variant="ghost" onClick={() => navigate('/achievements')}>
              업적 ({unlockedCount}/4)
            </Button>
          </nav>
        </header>

        <section className="rounded-2xl bg-[#161A21] border border-[#161A21] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[#4C8BF5]">Lv.{game.level}</span>
              <span className="text-sm text-[#8B9298]">{getRankTitle(game.level)}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="text-xs text-[#4C8BF5] hover:underline"
            >
              상세 →
            </button>
          </div>
          <p className="text-sm text-[#AAB2C0] mb-2">
            XP: {levelProgress.current} / {levelProgress.next}
          </p>
          <div className="h-2 rounded-full bg-[#0F1115] overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-[#4C8BF5] to-[#2ECC71] transition-all"
              style={{ width: `${levelProgress.percent}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="text-base font-bold text-[#F5B041]">
              {game.streakDays}일 연속 저축
            </span>
          </div>
          <p className="text-xs text-[#8B9298] mt-2">{gameMotivation}</p>
        </section>

        <section className="rounded-2xl bg-[#161A21] border border-[#161A21] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-[#E6EAF0]">오늘의 퀘스트</h2>
            <button
              type="button"
              onClick={() => navigate('/quests')}
              className="text-xs text-[#4C8BF5] hover:underline"
            >
              전체 보기 →
            </button>
          </div>
          <p className="text-sm text-[#AAB2C0] mb-4">
            {getQuestMotivationMessage(dailyQuests.quests)}
          </p>
          {dailyQuests.quests.length === 0 ? (
            <p className="text-sm text-[#8B9298]">오늘의 퀘스트를 불러오는 중...</p>
          ) : (
            <ul className="space-y-3">
              {dailyQuests.quests.map((q) => (
                <li
                  key={q.id}
                  className="flex items-center gap-3 rounded-xl bg-[#0F1115] p-4 cursor-pointer hover:bg-[#1e232c] transition-colors"
                  onClick={() => navigate('/quests')}
                >
                  <span
                    className="text-2xl shrink-0"
                    aria-hidden
                  >
                    {q.completed ? '☑' : '☐'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${
                        q.completed ? 'text-[#8B9298] line-through' : 'text-[#E6EAF0]'
                      }`}
                    >
                      {q.title}
                    </p>
                    <p className="text-xs text-[#8B9298] mt-0.5">
                      {q.completed ? '완료' : `보상: ${q.xpReward} XP`}
                    </p>
                  </div>
                  {q.completed && (
                    <span className="text-lg text-[#2ECC71] shrink-0">✓</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-[#4C8BF5]/20 to-[#2ECC71]/20 border border-[#4C8BF5]/30 p-8 text-center">
          <p className="text-sm text-[#AAB2C0] mb-2">총 저축액</p>
          <p className="text-5xl md:text-6xl font-bold text-[#2ECC71] tracking-tight">
            {formatKRW(stats.totalSaved)}
          </p>
          <p className="text-base text-[#AAB2C0] mt-4">{motivation}</p>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-[#E6EAF0]">저축 목표</h2>
            <Button
              variant="ghost"
              className="!py-1 !px-2 !text-xs"
              onClick={() => navigate('/goals/new')}
            >
              + 새 목표
            </Button>
          </div>
          {goals.length === 0 ? (
            <div
              className="rounded-xl bg-[#161A21] border border-dashed border-[#4C8BF5]/40 p-6 text-center"
              role="button"
              tabIndex={0}
              onClick={() => navigate('/goals/new')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/goals/new')}
            >
              <p className="text-[#8B9298] mb-2">아직 목표가 없어요</p>
              <p className="text-sm text-[#4C8BF5]">목표 만들기</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {goals.map((g) => {
                const isCompleted = !!g.completedAt || g.progressPercent >= 100
                const msg = getGoalMotivationMessage(g)
                return (
                  <li
                    key={g.id}
                    className="rounded-xl bg-[#161A21] p-4 cursor-pointer hover:bg-[#1e232c] transition-colors"
                    onClick={() => navigate(`/goals/${g.id}`)}
                  >
                    {isCompleted ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#E6EAF0]">{g.title}</p>
                          <p className="text-lg font-bold text-[#2ECC71]">🎉 목표 달성!</p>
                        </div>
                        <span className="text-2xl">🎉</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-[#E6EAF0]">{g.title}</p>
                          <p className="text-xl font-bold text-[#4C8BF5]">
                            {g.progressPercent}%
                          </p>
                        </div>
                        <p className="text-sm text-[#AAB2C0] mb-2">
                          {formatKRW(g.currentAmount)} / {formatKRW(g.targetAmount)}
                        </p>
                        <div className="h-2 rounded-full bg-[#0F1115] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#4C8BF5] to-[#2ECC71] transition-all"
                            style={{ width: `${Math.min(100, g.progressPercent)}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#8B9298] mt-2">{msg}</p>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-[#161A21] p-4">
            <p className="text-xs text-[#8B9298] mb-1">오늘 저축</p>
            <p className="text-xl font-bold text-[#E6EAF0]">
              {formatKRW(stats.todaySaved)}
            </p>
          </div>
          <div className="rounded-xl bg-[#161A21] p-4">
            <p className="text-xs text-[#8B9298] mb-1">이번 달</p>
            <p className="text-xl font-bold text-[#E6EAF0]">
              {formatKRW(stats.monthlySaved)}
            </p>
          </div>
          <div className="rounded-xl bg-[#161A21] p-4">
            <p className="text-xs text-[#8B9298] mb-1">연속 저축</p>
            <p className="text-xl font-bold text-[#F5B041]">
              {stats.streakDays}일
            </p>
          </div>
          <div className="rounded-xl bg-[#161A21] p-4 flex flex-col justify-center">
            <Button
              variant="primary"
              className="w-full !py-3"
              onClick={() => navigate('/add')}
            >
              + 저축 기록
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-base font-medium text-[#E6EAF0] mb-4">
            최근 저축 내역
          </h2>
          {recent.length === 0 ? (
            <div className="rounded-xl bg-[#161A21] p-8 text-center">
              <p className="text-[#8B9298] mb-4">
                아직 저축 기록이 없어요
              </p>
              <Button variant="primary" onClick={() => navigate('/add')}>
                첫 저축 기록하기
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((e) => (
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
      </div>

      {lastLevelUp !== null && (
        <LevelUpModal newLevel={lastLevelUp} onClose={clearLevelUp} />
      )}
      {lastQuestCompleted !== null && (
        <QuestCompleteModal
          quest={lastQuestCompleted.quest}
          xpEarned={lastQuestCompleted.xpEarned}
          onClose={clearLastQuestCompleted}
        />
      )}
    </div>
  )
}
