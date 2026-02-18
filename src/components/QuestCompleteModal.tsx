import type { Quest } from '../types/Quest'
import { Button } from './Button'

export type QuestCompleteModalProps = {
  quest: Quest
  xpEarned: number
  onClose: () => void
}

export function QuestCompleteModal({ quest, xpEarned, onClose }: QuestCompleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quest-complete-title"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#F5B041]/30 to-[#2ECC71]/30 border border-[#F5B041]/50 p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-6xl mb-4">✨</p>
        <h2 id="quest-complete-title" className="text-2xl font-bold text-[#E6EAF0] mb-2">
          퀘스트 완료!
        </h2>
        <p className="text-lg font-medium text-[#E6EAF0] mb-2">{quest.title}</p>
        <p className="text-2xl font-bold text-[#2ECC71] mb-6">
          +{xpEarned} XP 획득
        </p>
        <Button variant="primary" className="w-full" onClick={onClose}>
          확인
        </Button>
      </div>
    </div>
  )
}
