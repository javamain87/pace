export type SavingsEntry = {
  id: string
  title: string
  originalCost: number
  actualCost: number
  savedAmount: number
  createdAt: string
  goalId?: string
}

export type SavingsStats = {
  totalSaved: number
  monthlySaved: number
  todaySaved: number
  streakDays: number
}
