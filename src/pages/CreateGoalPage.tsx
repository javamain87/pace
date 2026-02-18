import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSavingsStore } from '../store/savingsStore'
import { formatKRW } from '../utils/format'
import { Button } from '../components'

export function CreateGoalPage() {
  const navigate = useNavigate()
  const createGoal = useSavingsStore((s) => s.createGoal)

  const [title, setTitle] = useState('')
  const [targetInput, setTargetInput] = useState('')

  const targetAmount = parseInt(targetInput.replace(/\D/g, ''), 10) || 0

  const handleCreate = () => {
    createGoal({
      title: title.trim() || '저축 목표',
      targetAmount,
    })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E6EAF0]">
      <div className="max-w-md mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-[#AAB2C0] hover:text-[#E6EAF0]"
          >
            ←
          </button>
          <h1 className="text-xl font-semibold">새 목표 만들기</h1>
        </header>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-[#AAB2C0] mb-2">목표 이름</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: iPad 구매"
              className="w-full rounded-xl border border-[#161A21] bg-[#161A21] px-4 py-4 text-lg text-[#E6EAF0] placeholder-[#8B9298] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-[#AAB2C0] mb-2">목표 금액 (원)</label>
            <input
              type="text"
              inputMode="numeric"
              value={targetInput}
              onChange={(e) =>
                setTargetInput(
                  e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                )
              }
              placeholder="예: 2,000,000"
              className="w-full rounded-xl border border-[#161A21] bg-[#161A21] px-4 py-4 text-lg text-[#E6EAF0] placeholder-[#8B9298] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
            />
            {targetAmount > 0 && (
              <p className="text-sm text-[#8B9298] mt-1">{formatKRW(targetAmount)}</p>
            )}
          </div>

          <Button
            variant="primary"
            className="w-full !py-4"
            disabled={!title.trim() || targetAmount <= 0}
            onClick={handleCreate}
          >
            목표 만들기
          </Button>
        </div>
      </div>
    </div>
  )
}
