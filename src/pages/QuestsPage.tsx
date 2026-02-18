import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSavingsStore } from '../store/savingsStore'
import { getQuestMotivationMessage } from '../services/QuestMotivationService'
import { Button } from '../components'

export function QuestsPage() {
  const navigate = useNavigate()
  const dailyQuests = useSavingsStore((s) => s.dailyQuests)
  const generateTodayQuests = useSavingsStore((s) => s.generateTodayQuests)

  useEffect(() => {
    generateTodayQuests()
  }, [generateTodayQuests])

  const completed = dailyQuests.quests.filter((q) => q.completed).length
  const total = dailyQuests.quests.length
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E6EAF0]">
      <div className="max-w-xl mx-auto px-6 py-10 space-y-6">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[#4C8BF5] hover:underline"
          >
            ← 뒤로
          </button>
          <h1 className="text-xl font-semibold text-[#E6EAF0]">오늘의 퀘스트</h1>
          <div className="w-12" />
        </header>

        <section className="rounded-2xl bg-gradient-to-br from-[#4C8BF5]/20 to-[#2ECC71]/20 border border-[#4C8BF5]/30 p-6 text-center">
          <p className="text-sm text-[#AAB2C0] mb-2">
            {getQuestMotivationMessage(dailyQuests.quests)}
          </p>
          <p className="text-3xl font-bold text-[#E6EAF0]">
            {completed} / {total} 완료
          </p>
          <div className="mt-4 h-2 rounded-full bg-[#0F1115]/50 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4C8BF5] to-[#2ECC71] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>

        <section>
          <h2 className="text-base font-medium text-[#E6EAF0] mb-4">퀘스트 목록</h2>
          {dailyQuests.quests.length === 0 ? (
            <div className="rounded-xl bg-[#161A21] p-8 text-center">
              <p className="text-[#8B9298] mb-4">오늘의 퀘스트를 불러오는 중...</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {dailyQuests.quests.map((q) => (
                <li
                  key={q.id}
                  className={`flex items-center gap-4 rounded-xl p-5 border transition-colors ${
                    q.completed
                      ? 'bg-[#161A21]/60 border-[#2ECC71]/30'
                      : 'bg-[#161A21] border-[#161A21] hover:border-[#4C8BF5]/30'
                  }`}
                >
                  <span
                    className="text-3xl shrink-0"
                    aria-hidden
                  >
                    {q.completed ? '☑' : '☐'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium text-lg ${
                        q.completed ? 'text-[#8B9298] line-through' : 'text-[#E6EAF0]'
                      }`}
                    >
                      {q.title}
                    </p>
                    <p className="text-sm text-[#AAB2C0] mt-1">{q.description}</p>
                    <p className="text-sm mt-2">
                      <span
                        className={
                          q.completed ? 'text-[#2ECC71]' : 'text-[#F5B041]'
                        }
                      >
                        {q.completed ? '✓ 완료' : `보상: ${q.xpReward} XP`}
                      </span>
                    </p>
                  </div>
                  {q.completed && (
                    <span className="text-2xl shrink-0">🎉</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="pt-4">
          <Button
            variant="primary"
            className="w-full !py-3"
            onClick={() => navigate('/add')}
          >
            + 저축 기록하고 퀘스트 완료하기
          </Button>
        </div>
      </div>
    </div>
  )
}
