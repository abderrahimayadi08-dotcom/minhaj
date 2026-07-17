import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'minhaj-data'

const now = () => new Date().toISOString().slice(0, 10)
const uid = () => Math.random().toString(36).slice(2, 9)

export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function daysBetween(a, b) {
  return Math.floor((new Date(b).setHours(0,0,0) - new Date(a).setHours(0,0,0)) / 86400000)
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return fmtDate(d)
}

const empty = {
  version: 1,
  groups: [],
  penalties: [],
  tasks: [],
  commitments: [],
  daily: {},
  penaltyLog: [],
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { ...empty }
  } catch { return { ...empty } }
}

function save(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function reducer(state, action) {
  switch (action.type) {
    // GROUPS
    case 'ADD_GROUP': {
      const g = { id: uid(), name: action.name, color: action.color, order: state.groups.length }
      return { ...state, groups: [...state.groups, g] }
    }
    case 'EDIT_GROUP': {
      const groups = state.groups.map(g => g.id === action.id ? { ...g, name: action.name, color: action.color } : g)
      return { ...state, groups }
    }
    case 'DEL_GROUP': {
      return { ...state, groups: state.groups.filter(g => g.id !== action.id) }
    }
    case 'REORDER_GROUPS': {
      return { ...state, groups: action.ids.map((id, i) => ({ ...state.groups.find(g => g.id === id), order: i })) }
    }

    // PENALTIES
    case 'ADD_PENALTY': {
      const p = { id: uid(), name: action.name, type: action.type, unit: action.unit, isMonetary: action.isMonetary }
      return { ...state, penalties: [...state.penalties, p] }
    }
    case 'DEL_PENALTY': {
      return { ...state, penalties: state.penalties.filter(p => p.id !== action.id) }
    }

    // TASKS
    case 'ADD_TASK': {
      const t = { id: uid(), ...action.task, parentId: action.parentId || null, createdAt: todayStr() }
      return { ...state, tasks: [...state.tasks, t] }
    }
    case 'EDIT_TASK': {
      const tasks = state.tasks.map(t => t.id === action.id ? { ...t, ...action.updates } : t)
      return { ...state, tasks }
    }
    case 'DEL_TASK': {
      const ids = new Set([action.id])
      state.tasks.filter(t => t.parentId === action.id).forEach(st => ids.add(st.id))
      return { ...state, tasks: state.tasks.filter(t => !ids.has(t.id)) }
    }
    case 'REORDER_TASKS': {
      return { ...state, tasks: action.ids.map((id, i) => ({ ...state.tasks.find(t => t.id === id), order: i })) }
    }

    // DAILY STATUS
    case 'SET_STATUS': {
      const day = action.date
      const dayData = { ...(state.daily[day] || {}) }
      if (action.status === null) {
        delete dayData[action.taskId]
      } else {
        dayData[action.taskId] = action.status
      }
      return { ...state, daily: { ...state.daily, [day]: dayData } }
    }
    case 'SET_SUBTASK_STATUS': {
      const day = action.date
      const dayData = { ...(state.daily[day] || {}) }
      const key = `${action.parentId}_${action.taskId}`
      if (action.status === null) {
        delete dayData[key]
      } else {
        dayData[key] = action.status
      }
      return { ...state, daily: { ...state.daily, [day]: dayData } }
    }

    // COMMITMENTS
    case 'ADD_COMMITMENT': {
      const c = { id: uid(), text: action.text, penaltyId: action.penaltyId, penaltyCount: action.penaltyCount, note: action.note || '', isMonetary: action.isMonetary, violations: 0, createdAt: todayStr() }
      return { ...state, commitments: [...state.commitments, c] }
    }
    case 'EDIT_COMMITMENT': {
      const commitments = state.commitments.map(c => c.id === action.id ? { ...c, ...action.updates } : c)
      return { ...state, commitments }
    }
    case 'DEL_COMMITMENT': {
      return { ...state, commitments: state.commitments.filter(c => c.id !== action.id) }
    }
    case 'VIOLATE_COMMITMENT': {
      return { ...state, commitments: state.commitments.map(c => c.id === action.id ? { ...c, violations: c.violations + 1 } : c) }
    }

    // PENALTY LOG
    case 'ADD_PENALTY_LOG': {
      return { ...state, penaltyLog: [...state.penaltyLog, { date: todayStr(), ...action.entry, id: uid() }] }
    }
    case 'CLEAR_PENALTY_LOG': {
      return { ...state, penaltyLog: [] }
    }

    default: return state
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load)

  useEffect(() => { save(state) }, [state])

  // Auto-fail tasks when day passes (for recurring/temporary without deadline)
  const failPending = useCallback((date) => {
    const today = todayStr()
    if (date >= today) return
    const dayData = state.daily[date] || {}
    const activeTasks = getActiveTasks(state, date)
    activeTasks.forEach(t => {
      if (!dayData[t.id] && !t.deadline) {
        dispatch({ type: 'SET_STATUS', date, taskId: t.id, status: 'failed' })
      }
      if (t.deadline && date > t.deadline && !dayData[t.id]) {
        dispatch({ type: 'SET_STATUS', date, taskId: t.id, status: 'failed' })
      }
    })
  }, [state])

  return <Ctx.Provider value={{ state, dispatch, failPending }}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore outside StoreProvider')
  return ctx
}

// Pure helpers
export function getActiveTasks(state, date) {
  return state.tasks
    .filter(t => !t.parentId)
    .filter(t => {
      if (t.type === 'temporary') return t.startDate === date
      if (t.type === 'recurring') return date >= t.startDate
      return false
    })
    .filter(t => {
      if (t.deadline) return date <= t.deadline
      return true
    })
    .sort((a, b) => a.order - b.order)
}

export function getSubtasks(state, taskId) {
  return state.tasks.filter(t => t.parentId === taskId).sort((a, b) => a.order - b.order)
}

export function getTaskStatus(state, date, taskId) {
  const day = state.daily[date]
  if (!day) return null
  return day[taskId] || null
}

export function getSubtaskStatus(state, date, parentId, taskId) {
  const day = state.daily[date]
  if (!day) return null
  return day[`${parentId}_${taskId}`] || null
}

export function getCompletionPct(state, date, taskId) {
  const subs = getSubtasks(state, taskId)
  if (!subs.length) return getTaskStatus(state, date, taskId) === 'completed' ? 100 : 0
  const done = subs.filter(s => getSubtaskStatus(state, date, taskId, s.id) === 'completed').length
  return Math.round((done / subs.length) * 100)
}

export function daysUntil(deadline) {
  if (!deadline) return null
  const diff = daysBetween(todayStr(), deadline)
  if (diff < 0) return null
  if (diff === 0) return 'آخر يوم'
  if (diff === 1) return 'غداً'
  if (diff < 7) return `${diff} أيام`
  const weeks = Math.floor(diff / 7)
  const days = diff % 7
  return days > 0 ? `${weeks} أسبوع و${days} أيام` : `${weeks} أسابيع`
}

export function getFailedTasks(state, date) {
  const day = state.daily[date]
  if (!day) return []
  return state.tasks.filter(t => {
    if (t.parentId) return false
    const status = day[t.id]
    return status === 'failed'
  })
}

export function getCompletedTasks(state, date) {
  const day = state.daily[date]
  if (!day) return []
  return state.tasks.filter(t => {
    if (t.parentId) return false
    // For tasks with subtasks, check if all are completed
    const subs = getSubtasks(state, t.id)
    if (subs.length) {
      return subs.every(s => getSubtaskStatus(state, date, t.id, s.id) === 'completed')
    }
    return day[t.id] === 'completed'
  })
}

export function getActiveDate() {
  const stored = localStorage.getItem('minhaj-active-date')
  if (stored) {
    const d = new Date(stored)
    if (!isNaN(d.getTime())) return fmtDate(d)
  }
  return todayStr()
}

export function setActiveDate(date) {
  localStorage.setItem('minhaj-active-date', date)
}
