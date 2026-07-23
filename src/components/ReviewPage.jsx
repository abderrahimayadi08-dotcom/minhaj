import { useState } from 'react'
import TaskCard from './TaskCard'
import DayBar from './DayBar'
import { useStore, getCompletedTasks, getFailedTasks, getActiveDate, setActiveDate } from '../store'
import { CheckCircle, XCircle } from 'lucide-react'

export default function ReviewPage() {
  const { state } = useStore()
  const [date, setDateState] = useState(getActiveDate)
  const [tab, setTab] = useState('completed')

  const completed = getCompletedTasks(state, date).filter(t => t.showInCompleted)
  const failed = getFailedTasks(state, date).filter(t => t.showInFailed)

  return (
    <div className="page">
      <h1 className="page-title">مراجعة المهام</h1>

      <div style={{ display: 'flex', marginBottom: 12, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <button onClick={() => setTab('completed')}
          style={{
            flex: 1, padding: '8px 12px', fontSize: 'var(--text-xs)', fontWeight: 700,
            background: tab === 'completed' ? 'var(--primary)' : 'var(--bg-card)',
            color: tab === 'completed' ? '#fff' : 'var(--text-secondary)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
          <CheckCircle size={14} /> المهام التامة
        </button>
        <button onClick={() => setTab('failed')}
          style={{
            flex: 1, padding: '8px 12px', fontSize: 'var(--text-xs)', fontWeight: 700,
            background: tab === 'failed' ? 'var(--primary)' : 'var(--bg-card)',
            color: tab === 'failed' ? '#fff' : 'var(--text-secondary)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
          <XCircle size={14} /> المهام الفاشلة
        </button>
      </div>

      <DayBar date={date} onChange={d => { setDateState(d); setActiveDate(d) }} />
      <div style={{ height: 12 }} />

      {tab === 'completed' ? (
        completed.length === 0 ? (
          <div className="empty-state"><p>لم تسجل مهاماً تامة في هذا اليوم. غيّر التاريخ أو أنجز مهامك</p></div>
        ) : completed.map(t => (
          <TaskCard key={t.id} task={t} date={date} />
        ))
      ) : (
        failed.length === 0 ? (
          <div className="empty-state"><p>لا توجد مهام فاشلة في هذا اليوم. استمر في أدائك الجيد</p></div>
        ) : failed.map(t => (
          <TaskCard key={t.id} task={t} date={date} />
        ))
      )}
    </div>
  )
}
