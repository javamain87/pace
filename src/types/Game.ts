export type GameStats = {
  xp: number
  level: number
  currentLevelXP: number
  nextLevelXP: number
  streakDays: number
  longestStreak: number
  lastSavingsDate?: string
}

export type LevelInfo = {
  level: number
  requiredXP: number
}

export const LEVEL_TABLE: LevelInfo[] = [
  { level: 1, requiredXP: 0 },
  { level: 2, requiredXP: 100 },
  { level: 3, requiredXP: 300 },
  { level: 4, requiredXP: 600 },
  { level: 5, requiredXP: 1000 },
  { level: 6, requiredXP: 1500 },
  { level: 7, requiredXP: 2100 },
  { level: 8, requiredXP: 2800 },
  { level: 9, requiredXP: 3600 },
  { level: 10, requiredXP: 4500 },
  { level: 11, requiredXP: 5500 },
  { level: 12, requiredXP: 6600 },
  { level: 13, requiredXP: 7800 },
  { level: 14, requiredXP: 9100 },
  { level: 15, requiredXP: 10500 },
  { level: 16, requiredXP: 12000 },
  { level: 17, requiredXP: 13600 },
  { level: 18, requiredXP: 15300 },
  { level: 19, requiredXP: 17100 },
  { level: 20, requiredXP: 19000 },
]

export function getRequiredXPForLevel(level: number): number {
  const info = LEVEL_TABLE.find((l) => l.level === level)
  if (info) return info.requiredXP
  const last = LEVEL_TABLE[LEVEL_TABLE.length - 1]
  if (level <= last.level) return last.requiredXP
  return last.requiredXP + (level - last.level) * 1000
}

export function getRankTitle(level: number): string {
  if (level >= 20) return 'Master of Money'
  if (level >= 10) return 'Elite Saver'
  if (level >= 5) return 'Smart Saver'
  if (level >= 3) return 'Growing Saver'
  if (level >= 2) return 'Rising Saver'
  return 'Beginner Saver'
}
