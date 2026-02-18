import type { Quest, DailyQuestState, QuestType } from '../types/Quest'

export type QuestTemplate = {
  type: QuestType
  title: string
  description: string
  xpReward: number
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    type: 'SKIP_COFFEE',
    title: '커피 사먹지 않기',
    description: '커피 대신 집에서 마시기',
    xpReward: 50,
  },
  {
    type: 'SAVE_5000',
    title: '5,000원 이상 저축하기',
    description: '한 번에 5천원 이상 아끼기',
    xpReward: 70,
  },
  {
    type: 'LOG_ENTRY',
    title: '저축 기록하기',
    description: '오늘 저축 내역 기록하기',
    xpReward: 30,
  },
  {
    type: 'MAINTAIN_STREAK',
    title: '연속 저축 유지하기',
    description: '오늘 하루라도 저축하기',
    xpReward: 40,
  },
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function generateDailyQuests(today: string): DailyQuestState {
  const shuffled = shuffle(QUEST_TEMPLATES)
  const selected = shuffled.slice(0, 3)
  const quests: Quest[] = selected.map((t) => ({
    id: crypto.randomUUID(),
    title: t.title,
    description: t.description,
    xpReward: t.xpReward,
    completed: false,
    createdAt: new Date().toISOString(),
    type: t.type,
  }))
  return { today, quests }
}
