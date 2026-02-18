import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SavingsEntry, SavingsStats } from '../types/Savings'
import type { SavingsGoal } from '../types/Goal'
import type { GameStats } from '../types/Game'
import type { Quest, DailyQuestState } from '../types/Quest'
import { LEVEL_TABLE, getRequiredXPForLevel } from '../types/Game'
import { generateDailyQuests } from '../services/QuestService'

function computeProgressPercent(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseDateKey(s: string): Date {
  return new Date(s)
}

function calculateStreakCorrect(entries: SavingsEntry[]): number {
  if (entries.length === 0) return 0
  const dateSet = new Set(entries.map((e) => formatDateKey(new Date(e.createdAt))))
  const sortedDates = [...dateSet].sort((a, b) => b.localeCompare(a))
  const today = formatDateKey(new Date())
  const yesterday = formatDateKey(new Date(Date.now() - 864e5))
  const mostRecent = sortedDates[0]
  if (mostRecent !== today && mostRecent !== yesterday) return 0
  let streak = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = parseDateKey(sortedDates[i - 1])
    const curr = parseDateKey(sortedDates[i])
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 864e5)
    if (diffDays === 1) streak++
    else break
  }
  return streak
}

function recalcStats(entries: SavingsEntry[]): SavingsStats {
  const now = new Date()
  const todayKey = formatDateKey(now)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthStartKey = formatDateKey(monthStart)

  let totalSaved = 0
  let monthlySaved = 0
  let todaySaved = 0

  for (const e of entries) {
    totalSaved += e.savedAmount
    const key = formatDateKey(new Date(e.createdAt))
    if (key >= monthStartKey) monthlySaved += e.savedAmount
    if (key === todayKey) todaySaved += e.savedAmount
  }

  const streakDays = calculateStreakCorrect(entries)

  return {
    totalSaved,
    monthlySaved,
    todaySaved,
    streakDays,
  }
}

function recalcGame(entries: SavingsEntry[], prevGame: GameStats, questXP = 0): GameStats {
  const entriesXP = entries.reduce((acc, e) => acc + Math.floor(e.savedAmount / 100), 0)
  const totalXP = entriesXP + questXP
  const streakDays = calculateStreakCorrect(entries)
  const lastEntry = entries[0]
  const lastSavingsDate = lastEntry
    ? formatDateKey(new Date(lastEntry.createdAt))
    : prevGame.lastSavingsDate

  let level = 1
  for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_TABLE[i].requiredXP) {
      level = LEVEL_TABLE[i].level
      break
    }
  }

  const currentLevelXP = getRequiredXPForLevel(level)
  const nextLevelXP = getRequiredXPForLevel(level + 1)
  const longestStreak = Math.max(prevGame.longestStreak, streakDays)

  return {
    xp: totalXP,
    level,
    currentLevelXP,
    nextLevelXP,
    streakDays,
    longestStreak,
    lastSavingsDate,
  }
}

function getInitialGame(): GameStats {
  return {
    xp: 0,
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: 100,
    streakDays: 0,
    longestStreak: 0,
    lastSavingsDate: undefined,
  }
}

type SavingsState = {
  entries: SavingsEntry[]
  stats: SavingsStats
  goals: SavingsGoal[]
  game: GameStats
  lastLevelUp: number | null
  dailyQuests: DailyQuestState
  questXP: number
  lastQuestCompleted: { quest: Quest; xpEarned: number } | null
}

type SavingsActions = {
  addSavingsEntry: (entry: Omit<SavingsEntry, 'id' | 'savedAmount' | 'goalId'>) => void
  recalculateStats: () => void
  getRecentSavings: (limit?: number) => SavingsEntry[]
  createGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'progressPercent' | 'createdAt'>) => void
  updateGoalProgress: (savedAmount: number, goalId?: string) => string | null
  getActiveGoals: () => SavingsGoal[]
  completeGoal: (goalId: string) => void
  addXP: (amount: number) => void
  updateLevel: () => void
  updateStreak: () => void
  getLevelProgress: () => { current: number; next: number; percent: number }
  clearLevelUp: () => void
  addRawXP: (xp: number) => void
  generateTodayQuests: () => void
  completeQuest: (questId: string) => void
  getTodayQuests: () => Quest[]
  clearLastQuestCompleted: () => void
}

const initialState: SavingsState = {
  entries: [],
  stats: {
    totalSaved: 0,
    monthlySaved: 0,
    todaySaved: 0,
    streakDays: 0,
  },
  goals: [],
  game: getInitialGame(),
  lastLevelUp: null,
  dailyQuests: { today: '', quests: [] },
  questXP: 0,
  lastQuestCompleted: null,
}

export const useSavingsStore = create<SavingsState & SavingsActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addSavingsEntry: (entry) => {
        const savedAmount = Math.max(0, entry.originalCost - entry.actualCost)
        const createdAt = entry.createdAt ?? new Date().toISOString()
        set((state) => {
          const today = formatDateKey(new Date())
          let dailyQuests = state.dailyQuests
          if (dailyQuests.today !== today) {
            dailyQuests = generateDailyQuests(today)
          }
          const quests = dailyQuests.quests

          const activeGoals = state.goals.filter((g) => !g.completedAt)
          const targetGoal = activeGoals[0] ?? null
          const goalId = targetGoal?.id ?? undefined

          const newEntry: SavingsEntry = {
            ...entry,
            id: crypto.randomUUID(),
            savedAmount,
            createdAt,
            goalId,
          }
          const entries = [newEntry, ...state.entries]
          const stats = recalcStats(entries)
          const streakDays = calculateStreakCorrect(entries)

          let goals = state.goals
          if (targetGoal && savedAmount > 0) {
            goals = goals.map((g) => {
              if (g.id !== targetGoal.id) return g
              const newCurrent = g.currentAmount + savedAmount
              const progressPercent = computeProgressPercent(newCurrent, g.targetAmount)
              const completedAt = progressPercent >= 100 ? new Date().toISOString() : g.completedAt
              return {
                ...g,
                currentAmount: newCurrent,
                progressPercent,
                completedAt,
              }
            })
          }

          const title = (entry.title ?? '').toLowerCase()
          const isCoffeeRelated = /커피|카페|coffee|cafe/.test(title)
          const now = new Date().toISOString()
          let questXP = state.questXP
          const completedQuests: Quest[] = []

          const updatedQuests = quests.map((q) => {
            if (q.completed) return q
            let shouldComplete = false
            switch (q.type) {
              case 'LOG_ENTRY':
                shouldComplete = true
                break
              case 'SAVE_5000':
                shouldComplete = savedAmount >= 5000
                break
              case 'SKIP_COFFEE':
                shouldComplete = savedAmount >= 3000 && isCoffeeRelated
                break
              case 'MAINTAIN_STREAK':
                shouldComplete = true
                break
            }
            if (shouldComplete) {
              questXP += q.xpReward
              completedQuests.push({ ...q, completed: true, completedAt: now })
              return { ...q, completed: true, completedAt: now }
            }
            return q
          })

          const totalXpEarned = completedQuests.reduce((s, q) => s + q.xpReward, 0)
          const lastQuestCompleted =
            completedQuests.length > 0
              ? { quest: completedQuests[completedQuests.length - 1], xpEarned: totalXpEarned }
              : null

          const prevGame = state.game
          const game = recalcGame(entries, prevGame, questXP)
          const didLevelUp = (savedAmount > 0 || totalXpEarned > 0) && game.level > prevGame.level
          return {
            entries,
            stats: { ...stats, streakDays },
            goals,
            game,
            lastLevelUp: didLevelUp ? game.level : state.lastLevelUp,
            dailyQuests: { ...dailyQuests, quests: updatedQuests },
            questXP,
            lastQuestCompleted,
          }
        })
      },

      addXP: (amount) => {
        const xpGain = Math.floor(amount / 100)
        if (xpGain <= 0) return
        set((state) => {
          const game = recalcGame(state.entries, state.game, state.questXP)
          return { game }
        })
      },

      addRawXP: (xp) => {
        if (xp <= 0) return
        set((state) => {
          const questXP = state.questXP + xp
          const game = recalcGame(state.entries, state.game, questXP)
          return { questXP, game }
        })
      },

      generateTodayQuests: () => {
        const today = formatDateKey(new Date())
        set((state) => {
          if (state.dailyQuests.today === today && state.dailyQuests.quests.length > 0)
            return state
          const dailyQuests = generateDailyQuests(today)
          return { dailyQuests }
        })
      },

      completeQuest: (questId) => {
        set((state) => {
          const today = formatDateKey(new Date())
          let dailyQuests = state.dailyQuests
          if (dailyQuests.today !== today) {
            dailyQuests = generateDailyQuests(today)
          }
          const quest = dailyQuests.quests.find((q) => q.id === questId)
          if (!quest || quest.completed) return state
          const now = new Date().toISOString()
          const questXP = state.questXP + quest.xpReward
          const updatedQuests = dailyQuests.quests.map((q) =>
            q.id === questId ? { ...q, completed: true, completedAt: now } : q
          )
          const game = recalcGame(state.entries, state.game, questXP)
          return {
            dailyQuests: { ...dailyQuests, quests: updatedQuests },
            questXP,
            game,
            lastQuestCompleted: { quest: { ...quest, completed: true, completedAt: now }, xpEarned: quest.xpReward },
          }
        })
      },

      getTodayQuests: () => get().dailyQuests.quests,

      clearLastQuestCompleted: () => set({ lastQuestCompleted: null }),

      updateLevel: () =>
        set((state) => ({
          game: recalcGame(state.entries, state.game, state.questXP),
        })),

      updateStreak: () =>
        set((state) => ({
          game: recalcGame(state.entries, state.game, state.questXP),
        })),

      getLevelProgress: () => {
        const g = get().game
        const current = g.xp - g.currentLevelXP
        const next = g.nextLevelXP - g.currentLevelXP
        const percent = next > 0 ? Math.min(100, Math.round((current / next) * 100)) : 100
        return { current: Math.max(0, current), next, percent }
      },

      clearLevelUp: () => set({ lastLevelUp: null }),

      createGoal: (goal) => {
        const newGoal: SavingsGoal = {
          ...goal,
          id: crypto.randomUUID(),
          currentAmount: 0,
          progressPercent: 0,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          goals: [newGoal, ...state.goals],
        }))
      },

      updateGoalProgress: (savedAmount, goalId) => {
        let assignedId: string | null = null
        set((state) => {
          const activeGoals = state.goals.filter((g) => !g.completedAt)
          const target = goalId
            ? activeGoals.find((g) => g.id === goalId)
            : activeGoals[0]
          if (!target || savedAmount <= 0)
            return state
          assignedId = target.id
          const goals = state.goals.map((g) => {
            if (g.id !== target.id) return g
            const newCurrent = g.currentAmount + savedAmount
            const progressPercent = computeProgressPercent(newCurrent, g.targetAmount)
            const completedAt = progressPercent >= 100 ? new Date().toISOString() : g.completedAt
            return {
              ...g,
              currentAmount: newCurrent,
              progressPercent,
              completedAt,
            }
          })
          return { goals }
        })
        return assignedId
      },

      getActiveGoals: () => {
        return get()
          .goals.filter((g) => !g.completedAt)
          .concat(get().goals.filter((g) => g.completedAt))
      },

      completeGoal: (goalId) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId ? { ...g, completedAt: g.completedAt ?? new Date().toISOString(), progressPercent: 100 } : g
          ),
        })),

      recalculateStats: () =>
        set((state) => ({
          stats: recalcStats(state.entries),
        })),

      getRecentSavings: (limit = 10) => {
        const entries = get().entries
        return entries.slice(0, limit)
      },
    }),
    {
      name: 'pace-savings-storage',
      partialize: (state) => ({
        entries: state.entries,
        goals: state.goals,
        dailyQuests: state.dailyQuests,
        questXP: state.questXP,
      }),
      merge: (persisted, current) => {
        const p = persisted as {
          entries?: SavingsEntry[]
          goals?: SavingsGoal[]
          dailyQuests?: DailyQuestState
          questXP?: number
        }
        const entries = p.entries ?? current.entries
        const goals = p.goals ?? current.goals
        const questXP = p.questXP ?? 0
        const today = formatDateKey(new Date())
        let dailyQuests = p.dailyQuests ?? current.dailyQuests
        if (dailyQuests.today !== today || dailyQuests.quests.length === 0) {
          dailyQuests = generateDailyQuests(today)
        }
        const stats = recalcStats(entries)
        const game = recalcGame(entries, current.game, questXP)
        return { ...current, entries, goals, stats, game, questXP, dailyQuests, lastLevelUp: null, lastQuestCompleted: null }
      },
    }
  )
)
