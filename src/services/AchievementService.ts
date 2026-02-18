import type { SavingsStats } from '../types/Savings'

export type Achievement = {
  id: string
  title: string
  description: string
  unlockedAt: string | null
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-savings',
    title: '첫 저축',
    description: '처음 저축을 기록했어요',
    unlockedAt: null,
  },
  {
    id: 'save-100k',
    title: '10만원 모아보기',
    description: '총 10만원 이상 저축했어요',
    unlockedAt: null,
  },
  {
    id: 'streak-7',
    title: '7일 연속 저축',
    description: '7일 연속으로 저축했어요',
    unlockedAt: null,
  },
  {
    id: 'streak-30',
    title: '30일 연속 저축',
    description: '30일 연속으로 저축했어요',
    unlockedAt: null,
  },
]

export function getUnlockedAchievements(
  stats: SavingsStats,
  entriesCount: number,
  streakDays: number
): Achievement[] {
  const now = new Date().toISOString()
  return ACHIEVEMENTS.map((a) => {
    let unlocked = false
    if (a.id === 'first-savings' && entriesCount >= 1) unlocked = true
    if (a.id === 'save-100k' && stats.totalSaved >= 100_000) unlocked = true
    if (a.id === 'streak-7' && streakDays >= 7) unlocked = true
    if (a.id === 'streak-30' && streakDays >= 30) unlocked = true
    return {
      ...a,
      unlockedAt: unlocked ? now : null,
    }
  }).filter((a) => a.unlockedAt !== null)
}

export function getAllAchievementsWithStatus(
  stats: SavingsStats,
  entriesCount: number,
  streakDays: number
): Achievement[] {
  const now = new Date().toISOString()
  return ACHIEVEMENTS.map((a) => {
    let unlocked = false
    if (a.id === 'first-savings' && entriesCount >= 1) unlocked = true
    if (a.id === 'save-100k' && stats.totalSaved >= 100_000) unlocked = true
    if (a.id === 'streak-7' && streakDays >= 7) unlocked = true
    if (a.id === 'streak-30' && streakDays >= 30) unlocked = true
    return {
      ...a,
      unlockedAt: unlocked ? now : null,
    }
  })
}
