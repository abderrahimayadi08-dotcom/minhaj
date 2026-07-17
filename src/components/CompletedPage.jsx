import { useState } from 'react'
import TaskCard from './TaskCard'
import DayBar from './DayBar'
import { useStore, getCompletedTasks, getActiveDate, setActiveDate, todayStr } from '../store'
import { CheckCircle } from 'lucide-react'

export default function CompletedPage() {
  const { state } = useStore()
  const [date, setDateState] = useState(getActiveDate)

  const tasks = getCompletedTasks(state, date).filter(t => t.showInCompleted)

  return (
    <div className="page">
      <h1 className="page-title">المهام التامة</h1>
      <DayBar date={date} onChange={d => { setDateState(d); setActiveDate(d) }} />
      <div style={{ height: 12 }} />
      {tasks.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={48} />
          <p>لا توجد مهام تامة في هذا اليوم</p>
        </div>
      ) : tasks.map(t => (
        <TaskCard key={t.id} task={t} date={date} />
      ))}
    </div>
  )
}
