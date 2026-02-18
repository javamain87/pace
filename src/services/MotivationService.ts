import type { SavingsGoal } from '../types/Goal'

export function getGoalMotivationMessage(goal: SavingsGoal): string {
  const { title, progressPercent } = goal

  if (goal.completedAt || progressPercent >= 100) {
    return '🎉 목표 달성!'
  }

  if (progressPercent >= 90) {
    return '거의 다 왔어요! 조금만 더!'
  }
  if (progressPercent >= 75) {
    return '목표가 눈에 보여요!'
  }
  if (progressPercent >= 50) {
    return `이제 절반 넘었어요! ${title}가 눈앞이에요`
  }
  if (progressPercent >= 25) {
    return `${title}까지 ${progressPercent}% 다 왔어요`
  }
  if (progressPercent >= 10) {
    return `잘하고 있어요! ${title}에 ${progressPercent}% 더 가까워졌어요`
  }
  if (progressPercent > 0) {
    return '시작이 반이에요! 화이팅!'
  }

  return `${title}를 향해 가고 있어요`
}

export function getGoalProgressMessage(goal: SavingsGoal): string {
  if (goal.completedAt || goal.progressPercent >= 100) {
    return '완료!'
  }
  const remaining = goal.targetAmount - goal.currentAmount
  if (remaining <= 0) return '완료!'
  return `목표까지 ₩${Math.round(remaining).toLocaleString()}`
}
