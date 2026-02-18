export type Quest = {
  id: string
  title: string
  description: string
  xpReward: number
  completed: boolean
  createdAt: string
  completedAt?: string
  type: QuestType
}

export type QuestType =
  | 'LOG_ENTRY'
  | 'SAVE_5000'
  | 'SKIP_COFFEE'
  | 'MAINTAIN_STREAK'

export type DailyQuestState = {
  today: string
  quests: Quest[]
}
