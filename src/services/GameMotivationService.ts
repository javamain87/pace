import type { GameStats } from '../types/Game'

export function getGameMotivationMessage(game: GameStats): string {
  const { xp, level, nextLevelXP, streakDays } = game
  const xpToNext = nextLevelXP - xp
  const percentToNext = nextLevelXP > 0 ? Math.round((xp / nextLevelXP) * 100) : 100

  const today = new Date().toISOString().slice(0, 10)
  const lastDate = game.lastSavingsDate
  const savedToday = lastDate === today
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
  const savedYesterday = lastDate === yesterday
  const needsStreakSave = !savedToday && (streakDays > 0 || savedYesterday)

  if (needsStreakSave && streakDays > 0) {
    return '오늘 저축해서 연속 기록을 유지해요! 🔥'
  }
  if (needsStreakSave) {
    return '오늘 저축해서 연속 저축을 시작해요!'
  }
  if (percentToNext >= 90 && xpToNext > 0) {
    return '레벨업이 눈앞이에요!'
  }
  if (percentToNext >= 75) {
    return '레벨업까지 조금만 더!'
  }
  if (streakDays >= 7) {
    return '7일 연속! 대단해요 👏'
  }
  if (streakDays >= 3) {
    return `${streakDays}일 연속 저축 중!`
  }
  if (savedToday) {
    return '오늘도 잘하고 있어요!'
  }
  if (level >= 10) {
    return '엘리트 세이버의 길을 걸어가고 있어요'
  }
  if (level >= 5) {
    return '저축 실력이 늘고 있어요'
  }
  if (xp > 0) {
    return '조금씩 모이다 보면 커져요'
  }
  return '첫 저축을 시작해 보세요!'
}
