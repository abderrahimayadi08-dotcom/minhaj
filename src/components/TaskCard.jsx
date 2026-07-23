import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Check, X, Edit3, Trash2 } from 'lucide-react'
import { useStore, getSubtasks, getSubtaskStatus, daysUntil } from '../store'
import SubtaskList from './SubtaskList'
import TaskForm from './TaskForm'

export default function TaskCard({ task, date }) {
  const { state, dispatch } = useStore()
  const [expanded, setExpanded] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const group = state.groups.find(g => g.id === task.groupId)
  const status = getTaskStatusEntry()
  const subs = getSubtasks(state, task.id)
  const remaining = daysUntil(task.deadline)
  const isDone = (() => {
    if (status === 'completed') return true
    if (subs.length > 0 && subs.every(s => { const ss = getSubtaskStatus(state, date, task.id, s.id); return ss === 'completed' })) return true
    return false
  })()
  const isFailed = status === 'failed'

  function getTaskStatusEntry() {
    const day = state.daily[date]
    if (!day) return null
    return day[task.id] || null
  }

  function handleSuccess() {
    if (subs.length) {
      if (isFailed) {
        dispatch({ type: 'REMOVE_PENALTY_LOG_BY_SOURCE', sourceId: task.id })
      }
      subs.forEach(s => dispatch({ type: 'SET_SUBTASK_STATUS', date, parentId: task.id, taskId: s.id, status: 'completed' }))
    } else {
      if (isFailed) {
        dispatch({ type: 'REMOVE_PENALTY_LOG_BY_SOURCE', sourceId: task.id })
      }
      if (status === 'completed') {
        dispatch({ type: 'SET_STATUS', date, taskId: task.id, status: null })
      } else {
        dispatch({ type: 'SET_STATUS', date, taskId: task.id, status: 'completed' })
      }
    }
  }

  const penaltyIds = task.penaltyIds || (task.penaltyId ? [task.penaltyId] : [])
  const getCount = (id) => (task.penaltyCounts && task.penaltyCounts[id]) || task.penaltyCount || 1

  function handleFail() {
    if (isFailed) return
    if (status && !isNaN(Number(status)) && Number(status) > 0) {
      dispatch({ type: 'REMOVE_PENALTY_LOG_BY_SOURCE', sourceId: task.id })
    }
    dispatch({ type: 'SET_STATUS', date, taskId: task.id, status: 'failed' })
    if (penaltyIds.length) {
      penaltyIds.forEach(id => {
        const penalty = state.penalties.find(p => p.id === id)
        dispatch({
          type: 'ADD_PENALTY_LOG',
          entry: {
            source: 'task', sourceId: task.id,
            penaltyText: penalty ? penalty.name : 'عقوبة',
            count: Number(getCount(id)),
            unit: penalty ? penalty.unit : '',
            isMonetary: penalty ? penalty.isMonetary : false,
          },
        })
      })
    }
  }

  return (
    <>
      <div className="task-card" style={{ opacity: isDone ? .6 : 1 }}>
        <div className="task-card-header">
          <div className="task-color-bar" style={{ background: group?.color || 'var(--border)' }} />
          <div className="task-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="task-text">{task.text}</div>
              <button onClick={() => setEditTask(task)} style={{ padding: 2, color: 'var(--text-muted)', flexShrink: 0 }}>
                <Edit3 size={14} />
              </button>
              <button onClick={() => { if (window.confirm(`حذف المهمة "${task.text}"؟`)) dispatch({ type: 'DEL_TASK', id: task.id }) }} style={{ padding: 2, color: 'var(--danger)', flexShrink: 0 }}>
                <Trash2 size={14} />
              </button>
            </div>
            {task.note && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4, padding: '4px 0', borderTop: '1px solid var(--border)', lineHeight: 1.5 }}>{task.note}</div>}
            <div className="task-meta">
              {remaining && <span className="deadline">متبقي {remaining}</span>}
            </div>
            <div className="task-actions">
              <button className={`task-btn success${isDone ? ' active-success' : ''}`} onClick={handleSuccess}>
                <Check /> تم
              </button>
              <button className={`task-btn danger${isFailed ? ' active-danger' : ''}`} onClick={handleFail} disabled={isFailed}>
                <X /> فشل
              </button>
            </div>
            {subs.length > 0 && (
              <button onClick={() => setExpanded(!expanded)} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, padding: '4px 0' }}>
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {subs.length} مهمة ثانوية
              </button>
            )}
            <button onClick={() => setShowAddForm(true)} style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, padding: '4px 0' }}>
              <Plus size={12} /> إضافة مهمة ثانوية
            </button>
          </div>
        </div>
        {expanded && subs.length > 0 && (
          <SubtaskList parentId={task.id} task={task} date={date} depth={0} />
        )}
      </div>
      {showAddForm && (
        <TaskForm
          onClose={() => setShowAddForm(false)}
          parentId={task.id}
          defaultGroupId={task.groupId}
          defaultPriority={task.priority}
        />
      )}
      {editTask && (
        <TaskForm
          onClose={() => setEditTask(null)}
          editTask={editTask}
        />
      )}
    </>
  )
}
