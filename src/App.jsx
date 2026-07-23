import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './components/HomePage'
import ReviewPage from './components/ReviewPage'
import CommitmentsPage from './components/CommitmentsPage'
import PenaltiesPage from './components/PenaltiesPage'
import SettingsPage from './components/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/commitments" element={<CommitmentsPage />} />
        <Route path="/penalties" element={<PenaltiesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
