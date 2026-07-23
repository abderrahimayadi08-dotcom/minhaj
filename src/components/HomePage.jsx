import { useState, useEffect, useRef } from 'react'
import { Plus, GripVertical, ChevronRight } from 'lucide-react'
import DayBar from './DayBar'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import { useStore, getActiveTasks, getActiveDate, setActiveDate, todayStr, addDays } from '../store'

export default function HomePage() {
  const { state, dispatch, failPending } = useStore()
  const [date, setDateState] = useState(getActiveDate)
  const [showForm, setShowForm] = useState(false)
  const [reorderMode, setReorderMode] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const dragIndex = useRef(null)

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

  const allTasks = getActiveTasks(state, date)

  const groupsWithTasks = {}
  state.groups.forEach(g => { groupsWithTasks[g.id] = { ...g, count: 0, tasks: [] } })
  let ungroupedCount = 0
  let ungroupedTasks = []
  allTasks.forEach(t => {
    if (t.groupId && groupsWithTasks[t.groupId]) {
      groupsWithTasks[t.groupId].count++
      groupsWithTasks[t.groupId].tasks.push(t)
    } else {
      ungroupedCount++
      ungroupedTasks.push(t)
    }
  })

  const currentGroup = selectedGroupId && selectedGroupId !== '__ungrouped__'
    ? state.groups.find(g => g.id === selectedGroupId) : null

  const parentGroupId = currentGroup?.parentId || null

  const selectedTasks = selectedGroupId === '__ungrouped__' ? ungroupedTasks
    : selectedGroupId ? (groupsWithTasks[selectedGroupId]?.tasks || []) : []

  const topLevelGroups = state.groups.filter(g => {
    if (g.parentId) return false
    const hasTasks = groupsWithTasks[g.id]?.count > 0
    const hasSubGroups = state.groups.some(sg => sg.parentId === g.id)
    return hasTasks || hasSubGroups
  })

  const subGroups = selectedGroupId && selectedGroupId !== '__ungrouped__'
    ? state.groups.filter(g => g.parentId === selectedGroupId).sort((a, b) => a.order - b.order)
    : []

  function handleDragStart(i) {
    dragIndex.current = i
  }

  function handleDragOver(e, i) {
    e.preventDefault()
    if (dragIndex.current === null || dragIndex.current === i) return
    const ids = [...selectedTasks]
    const dragged = ids.splice(dragIndex.current, 1)[0]
    ids.splice(i, 0, dragged)
    dragIndex.current = i
    dispatch({ type: 'REORDER_TASKS', ids: ids.map(t => t.id) })
  }

  function handleDragEnd() {
    dragIndex.current = null
  }

  const hasAnyTopLevel = topLevelGroups.length > 0 || ungroupedCount > 0

  return (
    <div className="page">
      <DayBar date={date} onChange={handleDateChange} />
      <div style={{ height: 8 }} />

      {selectedGroupId ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <button onClick={() => { setSelectedGroupId(parentGroupId); setReorderMode(false) }}
              style={{ padding: '4px 8px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              <ChevronRight size={16} style={{ verticalAlign: 'middle' }} /> العودة
            </button>
            <div style={{ width: 4, height: 20, background: currentGroup?.color || 'var(--border)', borderRadius: 2 }} />
            <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>
              {currentGroup?.name || 'بدون مجموعة'}
            </span>
          </div>
          {subGroups.map(sg => {
            const sgHasTasks = groupsWithTasks[sg.id]?.count > 0
            const sgHasSubGroups = state.groups.some(g => g.parentId === sg.id)
            return (
              <div key={sg.id} className="task-card" onClick={() => setSelectedGroupId(sg.id)} style={{ cursor: 'pointer', marginBottom: 6 }}>
                <div className="task-card-header">
                  <div className="task-color-bar" style={{ background: sg.color || 'var(--border)' }} />
                  <div className="task-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{sg.name}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {sgHasTasks && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                            {groupsWithTasks[sg.id].count} مهام
                          </span>
                        )}
                        {sgHasSubGroups && (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', background: 'var(--accent-light)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                            مجموعات
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: subGroups.length > 0 ? 4 : 0 }}>
            <button onClick={() => setReorderMode(r => !r)}
              style={{
                fontSize: 'var(--text-xs)', padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                background: reorderMode ? 'var(--primary)' : 'var(--bg-card)',
                color: reorderMode ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border)', fontWeight: 600,
              }}>
              {reorderMode ? 'إنهاء الترتيب' : 'ترتيب المهام'}
            </button>
          </div>
          {selectedTasks.length === 0 && subGroups.length === 0 && !showForm && (
            <div className="empty-state"><p>لا توجد مهام في هذه المجموعة. أضف مهمة جديدة من زر + في الأسفل</p></div>
          )}
          {selectedTasks.map((t, i) => (
            <div key={t.id}
              draggable={reorderMode}
              onDragStart={() => handleDragStart(i)}
              onDragOver={e => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              style={reorderMode ? { cursor: 'grab', userSelect: 'none', opacity: dragIndex.current === i ? 0.4 : 1, transition: 'opacity .15s' } : {}}
            >
              {reorderMode && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius) var(--radius) 0 0',
                  borderBottom: 'none', cursor: 'grab',
                }}>
                  <GripVertical size={14} /> {t.text}
                </div>
              )}
              <TaskCard task={t} date={date} />
            </div>
          ))}
        </>
      ) : (
        <>
          {!hasAnyTopLevel && !showForm && (
            <div className="empty-state"><p>لا توجد مهام لهذا اليوم. أضف مهمة جديدة من زر + في الأسفل</p></div>
          )}
          {topLevelGroups.map(g => (
            <div key={g.id} className="task-card" onClick={() => setSelectedGroupId(g.id)} style={{ cursor: 'pointer' }}>
              <div className="task-card-header">
                <div className="task-color-bar" style={{ background: g.color || 'var(--border)' }} />
                <div className="task-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>{g.name}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                      {groupsWithTasks[g.id].count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {ungroupedCount > 0 && (
            <div key="__ungrouped__" className="task-card" onClick={() => setSelectedGroupId('__ungrouped__')} style={{ cursor: 'pointer' }}>
              <div className="task-card-header">
                <div className="task-color-bar" style={{ background: 'var(--border)' }} />
                <div className="task-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>بدون مجموعة</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                      {ungroupedCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <button className="fab" onClick={() => setShowForm(true)}><Plus /></button>
      {showForm && (
        <TaskForm onClose={() => setShowForm(false)}
          defaultGroupId={selectedGroupId && selectedGroupId !== '__ungrouped__' ? selectedGroupId : ''} />
      )}
    </div>
  )
}
