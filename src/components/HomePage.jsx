import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import DayBar from './DayBar'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import { useStore, getActiveTasks, getActiveDate, setActiveDate, todayStr, addDays } from '../store'

export default function HomePage() {
  const { state, dispatch, failPending } = useStore()
  const [date, setDateState] = useState(getActiveDate)
  const [showForm, setShowForm] = useState(false)

  // Auto-fail past days on load
  useEffect(() => {
    const today = todayStr()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().slice(0, 10)
    for (let d = yStr; d < today; d = addDays(d, 1)) {
      failPending(d)
    }
  }, [])

  useEffect(() => {
    setActiveDate(date)
  }, [date])

  function handleDateChange(newDate) {
    setDateState(newDate)
  }

  const tasks = getActiveTasks(state, date)

  return (
    <div className="page">
      <DayBar date={date} onChange={handleDateChange} />
      <div style={{ height: 12 }} />
      {tasks.length === 0 && !showForm && (
        <div className="empty-state">
          <p>لا توجد مهام في هذا اليوم</p>
        </div>
      )}
      {tasks.map(t => (
        <TaskCard key={t.id} task={t} date={date} />
      ))}
      <button className="fab" onClick={() => setShowForm(true)}>
        <Plus />
      </button>
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
