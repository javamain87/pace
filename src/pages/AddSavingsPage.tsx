import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSavingsStore } from '../store/savingsStore'
import { formatKRW } from '../utils/format'
import { Button } from '../components'

type Step = 1 | 2 | 3 | 4

export function AddSavingsPage() {
  const navigate = useNavigate()
  const addSavingsEntry = useSavingsStore((s) => s.addSavingsEntry)

  const [step, setStep] = useState<Step>(1)
  const [title, setTitle] = useState('')
  const [originalCost, setOriginalCost] = useState('')
  const [actualCost, setActualCost] = useState('')

  const origNum = parseInt(originalCost.replace(/\D/g, ''), 10) || 0
  const actualNum = parseInt(actualCost.replace(/\D/g, ''), 10) || 0
  const savedAmount = Math.max(0, origNum - actualNum)

  const handleSave = () => {
    addSavingsEntry({
      title: title.trim() || '저축',
      originalCost: origNum,
      actualCost: actualNum,
      createdAt: new Date().toISOString(),
    })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E6EAF0]">
      <div className="max-w-md mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((s) => (s - 1) as Step) : navigate('/dashboard'))}
            className="text-[#AAB2C0] hover:text-[#E6EAF0]"
          >
            ←
          </button>
          <h1 className="text-xl font-semibold">저축 기록</h1>
        </header>

        {step === 1 && (
          <div className="space-y-6">
            <p className="text-[#AAB2C0]">뭘 아꼈나요?</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 스타벅스 커피"
              className="w-full rounded-xl border border-[#161A21] bg-[#161A21] px-4 py-4 text-lg text-[#E6EAF0] placeholder-[#8B9298] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
              autoFocus
            />
            <Button
              variant="primary"
              className="w-full !py-4"
              disabled={!title.trim()}
              onClick={() => setStep(2)}
            >
              다음
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-[#AAB2C0]">원래 비용 (원)</p>
            <input
              type="text"
              inputMode="numeric"
              value={originalCost}
              onChange={(e) =>
                setOriginalCost(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))
              }
              placeholder="예: 6500"
              className="w-full rounded-xl border border-[#161A21] bg-[#161A21] px-4 py-4 text-lg text-[#E6EAF0] placeholder-[#8B9298] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
              autoFocus
            />
            <Button
              variant="primary"
              className="w-full !py-4"
              disabled={origNum <= 0}
              onClick={() => setStep(3)}
            >
              다음
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <p className="text-[#AAB2C0]">실제 사용한 비용 (원)</p>
            <input
              type="text"
              inputMode="numeric"
              value={actualCost}
              onChange={(e) =>
                setActualCost(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))
              }
              placeholder="예: 800"
              className="w-full rounded-xl border border-[#161A21] bg-[#161A21] px-4 py-4 text-lg text-[#E6EAF0] placeholder-[#8B9298] focus:outline-none focus:ring-2 focus:ring-[#4C8BF5]/50"
              autoFocus
            />
            <Button
              variant="primary"
              className="w-full !py-4"
              disabled={actualNum < 0 || actualNum > origNum}
              onClick={() => setStep(4)}
            >
              다음
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div className="rounded-2xl bg-gradient-to-br from-[#2ECC71]/20 to-[#4C8BF5]/20 border border-[#2ECC71]/40 p-8 text-center">
              <p className="text-[#AAB2C0] mb-2">저축했어요!</p>
              <p className="text-4xl font-bold text-[#2ECC71]">
                {formatKRW(savedAmount)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-[#8B9298]">{title}</p>
              <p className="text-sm text-[#AAB2C0]">
                {formatKRW(origNum)} → {formatKRW(actualNum)}
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full !py-4"
              onClick={handleSave}
            >
              저축 저장
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
