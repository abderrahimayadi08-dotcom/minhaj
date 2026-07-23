import { useState } from 'react'
import TaskCard from './TaskCard'
import DayBar from './DayBar'
import { useStore, getFailedTasks, getActiveDate, setActiveDate } from '../store'
import { XCircle } from 'lucide-react'

export default function FailedPage() {
  const { state } = useStore()
  const [date, setDateState] = useState(getActiveDate)

  const tasks = getFailedTasks(state, date).filter(t => t.showInFailed)

  return (
    <div className="page">
      <h1 className="page-title">المهام الفاشلة</h1>
      <DayBar date={date} onChange={d => { setDateState(d); setActiveDate(d) }} />
      <div style={{ height: 12 }} />
      {tasks.length === 0 ? (
        <div className="empty-state">
          <XCircle size={48} />
          <p>لا توجد مهام فاشلة لهذا اليوم — أحسنت! تابع أداءك</p>
        </div>
      ) : tasks.map(t => (
        <TaskCard key={t.id} task={t} date={date} />
      ))}
    </div>
  )
}
