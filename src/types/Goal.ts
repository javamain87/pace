export type SavingsGoal = {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  progressPercent: number
  createdAt: string
  completedAt?: string
}
