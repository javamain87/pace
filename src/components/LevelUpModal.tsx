import { Button } from './Button'

export type LevelUpModalProps = {
  newLevel: number
  onClose: () => void
}

const REWARD_MESSAGES: Record<number, string> = {
  2: '저축 습관이 자라기 시작했어요!',
  3: '꾸준함이 빛을 발하고 있어요',
  4: '실력이 느는 중이에요',
  5: 'Smart Saver가 되었어요!',
  6: '저축이 생활이 되고 있어요',
  7: '멋진 진행이에요',
  8: '거의 프로 수준!',
  9: '조금만 더!',
  10: 'Elite Saver! 엘리트 저축가예요',
}

const DEFAULT_REWARD = '저축 실력을 키우고 있어요!'

function getRewardMessage(level: number): string {
  return REWARD_MESSAGES[level] ?? DEFAULT_REWARD
}

export function LevelUpModal({ newLevel, onClose }: LevelUpModalProps) {
  const message = getRewardMessage(newLevel)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-up-title"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-[#4C8BF5]/30 to-[#2ECC71]/30 border border-[#4C8BF5]/50 p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-6xl mb-4">🎉</p>
        <h2 id="level-up-title" className="text-2xl font-bold text-[#E6EAF0] mb-2">
          LEVEL UP!
        </h2>
        <p className="text-xl font-bold text-[#4C8BF5] mb-2">
          Level {newLevel}
        </p>
        <p className="text-[#AAB2C0] mb-6">{message}</p>
        <Button variant="primary" className="w-full" onClick={onClose}>
          확인
        </Button>
      </div>
    </div>
  )
}
