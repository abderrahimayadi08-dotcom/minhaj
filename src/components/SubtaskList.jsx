import { useStore, getSubtasks, getSubtaskStatus } from '../store'
import { Plus, Edit3, GripVertical } from 'lucide-react'
import { useState, useRef } from 'react'
import TaskForm from './TaskForm'

export default function SubtaskList({ parentId, task, date, depth }) {
  const { state, dispatch } = useStore()
  const subs = getSubtasks(state, parentId)
  const [showForm, setShowForm] = useState(false)
  const [editSub, setEditSub] = useState(null)
  const [dragMode, setDragMode] = useState(false)
  const dragIndex = useRef(null)

  if (!subs.length) return null

  function handleSubSuccess(sub) {
    const current = getSubtaskStatus(state, date, parentId, sub.id)
    if (current === 'failed') {
      dispatch({ type: 'REMOVE_PENALTY_LOG_BY_SOURCE', sourceId: sub.id })
    }
    dispatch({ type: 'SET_SUBTASK_STATUS', date, parentId, taskId: sub.id, status: 'completed' })
  }

  function handleSubFail(sub) {
    const current = getSubtaskStatus(state, date, parentId, sub.id)
    if (current === 'failed') return
    if (current && !isNaN(Number(current)) && Number(current) > 0) {
      dispatch({ type: 'REMOVE_PENALTY_LOG_BY_SOURCE', sourceId: sub.id })
    }
    dispatch({ type: 'SET_SUBTASK_STATUS', date, parentId, taskId: sub.id, status: 'failed' })
    const subPenaltyIds = sub.penaltyIds || (sub.penaltyId ? [sub.penaltyId] : [])
    subPenaltyIds.forEach(id => {
      const penalty = state.penalties.find(p => p.id === id)
      const cnt = (sub.penaltyCounts && sub.penaltyCounts[id]) || sub.penaltyCount || 1
      dispatch({
        type: 'ADD_PENALTY_LOG',
        entry: {
          source: 'task', sourceId: sub.id,
          penaltyText: penalty ? penalty.name : 'عقوبة',
          count: Number(cnt),
          unit: penalty ? penalty.unit : '',
          isMonetary: penalty ? penalty.isMonetary : false,
        },
      })
    })
  }

  function handleDragStart(_, e) {
    dragIndex.current = subs.indexOf(_)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', _.id)
  }

  function handleDragOver(sub, e) {
    e.preventDefault()
    const i = subs.indexOf(sub)
    if (i === dragIndex.current) return
    const items = subs.map(s => s.id)
    const [dragged] = items.splice(dragIndex.current, 1)
    items.splice(i, 0, dragged)
    dragIndex.current = i
    dispatch({ type: 'REORDER_SUBTASKS', parentId, ids: items })
  }

  function handleDragEnd() {
    dragIndex.current = null
  }

  return (
    <div className="subtask-list">
      {subs.map(sub => {
        const subStatus = getSubtaskStatus(state, date, parentId, sub.id)
        const subIsFailed = subStatus === 'failed'
        const childSubs = getSubtasks(state, sub.id)
        return (
          <div key={sub.id} className="subtask-item"
            draggable={dragMode}
            onDragStart={e => handleDragStart(sub, e)}
            onDragOver={e => handleDragOver(sub, e)}
            onDragEnd={handleDragEnd}
            style={{ position: 'relative' }}>
            <div className="subtask-top-row">
              {dragMode && (
                <span className="subtask-drag-handle">
                  <GripVertical size={14} />
                </span>
              )}
              <span className="subtask-text">{sub.text}</span>
              {(sub.penaltyId || (sub.penaltyIds && sub.penaltyIds.length)) && <span style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)' }}>⚡</span>}
              <button onClick={() => setEditSub(sub)} style={{ padding: 2, color: 'var(--text-muted)', flexShrink: 0 }}>
                <Edit3 size={14} />
              </button>
            </div>
            <div className="subtask-actions-row">
              <button className="subtask-pct-btn danger" onClick={() => handleSubFail(sub)}
                disabled={subIsFailed}
                style={{ padding: '6px 10px', fontSize: 'var(--text-sm)' }}>
                فشل
              </button>
              <button className="subtask-pct-btn success" onClick={() => handleSubSuccess(sub)}
                style={{ padding: '6px 10px', fontSize: 'var(--text-sm)' }}>
                تم
              </button>
            </div>
            {childSubs.length > 0 && (
              <button onClick={() => {}} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                {childSubs.length} مهمة ثانوية
              </button>
            )}
          </div>
        )
      })}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {depth === 0 && (
          <button onClick={() => setShowForm(true)} style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px' }}>
            <Plus size={14} /> إضافة مهمة ثانوية
          </button>
        )}
        {subs.length > 1 && (
          <button onClick={() => setDragMode(!dragMode)} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px' }}>
            {dragMode ? 'إنهاء الترتيب' : 'ترتيب المهام'}
          </button>
        )}
      </div>
      {showForm && <TaskForm onClose={() => setShowForm(false)} parentId={parentId} />}
      {editSub && <TaskForm onClose={() => setEditSub(null)} editTask={editSub} />}
    </div>
  )
}
