import type { Quest } from '../types/Quest'

export function getQuestMotivationMessage(quests: Quest[]): string {
  const completed = quests.filter((q) => q.completed).length
  const total = quests.length

  if (total === 0) return '오늘의 퀘스트를 시작해 보세요!'
  if (completed === total) return '오늘 퀘스트 모두 완료! 🎉'
  if (completed === total - 1) return '한 개의 퀘스트만 남았어요!'
  if (completed >= 1) return `오늘 ${completed}/${total}개 완료!`
  return '오늘의 퀘스트를 완료해 보세요'
}
