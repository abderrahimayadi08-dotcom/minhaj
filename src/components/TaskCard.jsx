import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { useStore, getSubtasks, getSubtaskStatus, getCompletionPct, daysUntil } from '../store'
import SubtaskList from './SubtaskList'
import TaskForm from './TaskForm'

export default function TaskCard({ task, date }) {
  const { state, dispatch } = useStore()
  const [expanded, setExpanded] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const group = state.groups.find(g => g.id === task.groupId)
  const status = getTaskStatusEntry()
  const completion = getCompletionPct(state, date, task.id)
  const subs = getSubtasks(state, task.id)
  const remaining = daysUntil(task.deadline)
  const isDone = completion === 100 || (!subs.length && status === 'completed')
  const isFailed = status === 'failed'

  function getTaskStatusEntry() {
    const day = state.daily[date]
    if (!day) return null
    return day[task.id] || null
  }

  function handleSuccess() {
    if (subs.length) {
      // Complete all subtasks
      subs.forEach(s => dispatch({ type: 'SET_SUBTASK_STATUS', date, parentId: task.id, taskId: s.id, status: 'completed' }))
    } else {
      if (status === 'completed') {
        dispatch({ type: 'SET_STATUS', date, taskId: task.id, status: null })
      } else {
        dispatch({ type: 'SET_STATUS', date, taskId: task.id, status: 'completed' })
      }
    }
  }

  function handleFail() {
    const newStatus = status === 'failed' ? null : 'failed'
    dispatch({ type: 'SET_STATUS', date, taskId: task.id, status: newStatus })
    if (newStatus === 'failed' && task.penaltyId) {
      const penalty = state.penalties.find(p => p.id === task.penaltyId)
      dispatch({
        type: 'ADD_PENALTY_LOG',
        entry: {
          source: 'task', sourceId: task.id,
          penaltyText: penalty ? penalty.name : 'عقوبة',
          count: Number(task.penaltyCount),
          unit: penalty ? penalty.unit : '',
          isMonetary: penalty ? penalty.isMonetary : false,
        },
      })
    }
  }

  return (
    <>
      <div className="task-card" style={{ opacity: isDone ? .6 : 1 }}>
        <div className="task-card-header">
          <div className="task-color-bar" style={{ background: group?.color || 'var(--border)' }} />
          <div className="task-content">
            <div className="task-text">{task.text}</div>
            <div className="task-meta">
              {task.priority > 1 && <span className="priority">{'★'.repeat(task.priority)}</span>}
              {remaining && <span className="deadline">متبقي {remaining}</span>}
              {subs.length > 0 && <span className="completion">{completion}% مكتمل</span>}
              {task.penaltyId && <span style={{ color: 'var(--danger)' }}>⚡</span>}
              {task.type === 'recurring' && <span style={{ color: 'var(--text-muted)' }}>🔄 يومي</span>}
            </div>
            <div className="task-actions">
              <button className={`task-btn success${isDone ? ' active-success' : ''}`} onClick={handleSuccess}>
                <Check /> تم
              </button>
              <button className={`task-btn danger${isFailed ? ' active-danger' : ''}`} onClick={handleFail}>
                <X /> فشل
              </button>
            </div>
            {subs.length > 0 && (
              <button onClick={() => setExpanded(!expanded)} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, padding: '4px 0' }}>
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {subs.length} مهمة ثانوية
              </button>
            )}
            <button onClick={() => setShowForm(true)} style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, padding: '4px 0' }}>
              <Plus size={12} /> إضافة مهمة ثانوية
            </button>
          </div>
        </div>
        {expanded && subs.length > 0 && (
          <SubtaskList parentId={task.id} task={task} date={date} depth={0} />
        )}
      </div>
      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          parentId={task.id}
          defaultGroupId={task.groupId}
          defaultPriority={task.priority}
        />
      )}
    </>
  )
}
