import { Routes, Route, Navigate } from 'react-router-dom'
import { SavingsDashboardPage } from './pages/SavingsDashboardPage'
import { AddSavingsPage } from './pages/AddSavingsPage'
import { AchievementsPage } from './pages/AchievementsPage'
import { QuestsPage } from './pages/QuestsPage'
import { CreateGoalPage } from './pages/CreateGoalPage'
import { GoalDetailPage } from './pages/GoalDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<SavingsDashboardPage />} />
      <Route path="/add" element={<AddSavingsPage />} />
      <Route path="/quests" element={<QuestsPage />} />
      <Route path="/achievements" element={<AchievementsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/goals" element={<Navigate to="/dashboard" replace />} />
      <Route path="/goals/new" element={<CreateGoalPage />} />
      <Route path="/goals/:id" element={<GoalDetailPage />} />
    </Routes>
  )
}
