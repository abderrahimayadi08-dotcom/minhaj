import { useStore, getSubtasks, getSubtaskStatus } from '../store'
import { Plus, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import TaskForm from './TaskForm'

export default function SubtaskList({ parentId, task, date, depth }) {
  const { state, dispatch } = useStore()
  const subs = getSubtasks(state, parentId)
  const [expanded, setExpanded] = useState({})
  const [showForm, setShowForm] = useState(false)

  if (!subs.length) return null

  function toggleSubtask(sub) {
    const key = `${parentId}_${sub.id}`
    const current = getSubtaskStatus(state, date, parentId, sub.id)
    dispatch({
      type: 'SET_SUBTASK_STATUS',
      date,
      parentId,
      taskId: sub.id,
      status: current === 'completed' ? null : 'completed',
    })
  }

  return (
    <div className="subtask-list" style={{ marginRight: depth * 12 }}>
      {subs.map(sub => {
        const subStatus = getSubtaskStatus(state, date, parentId, sub.id)
        const done = subStatus === 'completed'
        const childSubs = getSubtasks(state, sub.id)
        return (
          <div key={sub.id}>
            <div className="subtask-item" onClick={() => toggleSubtask(sub)}>
              <div className={`subtask-checkbox${done ? ' done' : ''}`}>
                {done && <Check size={12} />}
              </div>
              <span className={`subtask-text${done ? ' done' : ''}`}>{sub.text}</span>
              {sub.penaltyId && <span style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)' }}>⚡</span>}
              {childSubs.length > 0 && (
                <button onClick={e => { e.stopPropagation(); setExpanded({ ...expanded, [sub.id]: !expanded[sub.id] }) }} style={{ padding: 2 }}>
                  {expanded[sub.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
            {expanded[sub.id] && childSubs.length > 0 && (
              <SubtaskList parentId={sub.id} task={sub} date={date} depth={depth + 1} />
            )}
          </div>
        )
      })}
      <button onClick={() => setShowForm(true)} style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px' }}>
        <Plus size={12} /> إضافة مهمة ثانوية
      </button>
      {showForm && <TaskForm onClose={() => setShowForm(false)} parentId={parentId} />}
    </div>
  )
}
