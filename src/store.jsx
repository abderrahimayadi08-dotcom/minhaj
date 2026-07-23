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
  version: 4,
  groups: [],
  penalties: [],
  tasks: [],
  commitments: [],
  commitmentGroups: [],
  daily: {},
  penaltyLog: [],
  penaltyReductions: [],
  violationLog: [],
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...empty }
    const data = JSON.parse(raw)
    if (!data.version || data.version < 2) {
      data.commitmentGroups = data.commitmentGroups || []
      data.violationLog = data.violationLog || []
      data.version = 2
    }
    if (!data.version || data.version < 3) {
      data.penaltyReductions = data.penaltyReductions || []
      data.version = 3
    }
    if (!data.version || data.version < 4) {
      data.groups = data.groups.map(g => ({ ...g, parentId: g.parentId || null }))
      data.version = 4
    }
    return data
  } catch { return { ...empty } }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('localStorage save failed:', e)
    alert('حدث خطأ في حفظ البيانات! قد يكون مساحة التخزين ممتلئة. يرجى تصدير البيانات من الإعدادات.')
  }
}

function reducer(state, action) {
  switch (action.type) {
    // GROUPS
    case 'ADD_GROUP': {
      const g = { id: uid(), name: action.name, color: action.color, parentId: action.parentId || null, order: state.groups.length }
      return { ...state, groups: [...state.groups, g] }
    }
    case 'EDIT_GROUP': {
      const groups = state.groups.map(g => g.id === action.id ? { ...g, name: action.name, color: action.color, parentId: action.parentId !== undefined ? action.parentId : g.parentId } : g)
      return { ...state, groups }
    }
    case 'DEL_GROUP': {
      const ids = new Set([action.id])
      let prev
      while (prev !== ids.size) { prev = ids.size; state.groups.forEach(g => { if (ids.has(g.parentId)) ids.add(g.id) }) }
      return { ...state, groups: state.groups.filter(g => !ids.has(g.id)) }
    }
    case 'REORDER_GROUPS': {
      const orderMap = {}
      action.ids.forEach((id, i) => { orderMap[id] = i })
      return { ...state, groups: state.groups.map(g => ({
        ...g,
        order: orderMap[g.id] !== undefined ? orderMap[g.id] : g.order
      })) }
    }

    // PENALTIES
    case 'ADD_PENALTY': {
      const p = { id: uid(), name: action.name, type: action.penaltyType, unit: action.unit, isMonetary: action.isMonetary }
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
      const orderMap = {}
      action.ids.forEach((id, i) => { orderMap[id] = i })
      return { ...state, tasks: state.tasks.map(t => ({
        ...t,
        order: orderMap[t.id] !== undefined ? orderMap[t.id] : t.order
      })) }
    }
    case 'REORDER_SUBTASKS': {
      const tasks = state.tasks.map(t => {
        if (t.parentId === action.parentId) {
          const idx = action.ids.indexOf(t.id)
          return { ...t, order: idx >= 0 ? idx : t.order }
        }
        return t
      })
      return { ...state, tasks }
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

    // COMMITMENT GROUPS
    case 'ADD_COMMITMENT_GROUP': {
      const colors = ['#4A7C59', '#C4843D', '#B8453A', '#D4A847', '#4A90D9', '#8E5EA2', '#2C8C7C', '#D9654B']
      const color = action.color || colors[state.commitmentGroups.length % colors.length]
      const g = { id: uid(), name: action.name, color, order: state.commitmentGroups.length }
      return { ...state, commitmentGroups: [...state.commitmentGroups, g] }
    }
    case 'DEL_COMMITMENT_GROUP': {
      const hasCommitments = state.commitments.some(c => c.groupId === action.id)
      if (hasCommitments) return state
      return { ...state, commitmentGroups: state.commitmentGroups.filter(g => g.id !== action.id) }
    }

    // COMMITMENTS
    case 'ADD_COMMITMENT': {
      const c = { id: uid(), text: action.text, penaltyId: action.penaltyId, penaltyCount: action.penaltyCount, note: action.note || '', isMonetary: action.isMonetary, violations: 0, createdAt: todayStr(), groupId: action.groupId || null, order: state.commitments.filter(cv => cv.groupId === (action.groupId || null)).length }
      return { ...state, commitments: [...state.commitments, c] }
    }
    case 'EDIT_COMMITMENT': {
      const commitments = state.commitments.map(c => c.id === action.id ? { ...c, ...action.updates } : c)
      return { ...state, commitments }
    }
    case 'DEL_COMMITMENT': {
      return { ...state, commitments: state.commitments.filter(c => c.id !== action.id) }
    }
    case 'REORDER_COMMITMENTS': {
      const orderMap = {}
      action.ids.forEach((id, i) => { orderMap[id] = i })
      return { ...state, commitments: state.commitments.map(c => ({
        ...c,
        order: orderMap[c.id] !== undefined ? orderMap[c.id] : c.order
      })) }
    }
    case 'VIOLATE_COMMITMENT': {
      return { ...state, commitments: state.commitments.map(c => c.id === action.id ? { ...c, violations: c.violations + 1 } : c) }
    }

    // VIOLATION LOG
    case 'ADD_VIOLATION_LOG': {
      return { ...state, violationLog: [...state.violationLog, { date: action.date || todayStr(), ...action.entry, id: uid() }] }
    }
    case 'CLEAR_VIOLATION_LOG': {
      return { ...state, violationLog: [] }
    }

    // PENALTY LOG
    case 'ADD_PENALTY_LOG': {
      return { ...state, penaltyLog: [...state.penaltyLog, { date: todayStr(), ...action.entry, id: uid() }] }
    }
    case 'REMOVE_PENALTY_LOG_BY_SOURCE': {
      return { ...state, penaltyLog: state.penaltyLog.filter(e => !(e.source === 'task' && e.sourceId === action.sourceId)) }
    }
    case 'REDUCE_PENALTY': {
      return { ...state, penaltyReductions: [...state.penaltyReductions, { id: uid(), date: todayStr(), text: action.text, isMonetary: action.isMonetary, count: action.count }] }
    }
    case 'INCREASE_PENALTY': {
      return { ...state, penaltyLog: [...state.penaltyLog, { date: todayStr(), source: 'manual_increase', penaltyText: action.text, count: action.count, unit: action.unit, isMonetary: action.isMonetary, id: uid() }] }
    }
    case 'DELETE_PENALTY_LOG_BY_TEXT': {
      return { ...state, penaltyLog: state.penaltyLog.filter(e => !(e.penaltyText === action.text && e.isMonetary === action.isMonetary)) }
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
      let doFail = false
      if (!dayData[t.id] && !t.deadline) { doFail = true }
      if (t.deadline && date > t.deadline && !dayData[t.id]) { doFail = true }
      if (!doFail) return
      dispatch({ type: 'SET_STATUS', date, taskId: t.id, status: 'failed' })
      const tPenaltyIds = t.penaltyIds || (t.penaltyId ? [t.penaltyId] : [])
      tPenaltyIds.forEach(pid => {
        const penalty = state.penalties.find(p => p.id === pid)
        const cnt = (t.penaltyCounts && t.penaltyCounts[pid]) || t.penaltyCount || 1
        dispatch({
          type: 'ADD_PENALTY_LOG',
          entry: {
            source: 'task', sourceId: t.id,
            penaltyText: penalty ? penalty.name : 'عقوبة',
            count: Number(cnt),
            unit: penalty ? penalty.unit : '',
            isMonetary: penalty ? penalty.isMonetary : false,
          },
        })
      })
    })
  }, [state])

  return <Ctx.Provider value={{ state, dispatch, failPending }}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore outside StoreProvider')
  return ctx
}

export function isTaskActiveOnDate(task, date, state) {
  if (date < task.startDate) return false
  if (task.deadline && date > task.deadline) return false
  if (task.type === 'temporary') return task.startDate === date
  if (task.type === 'until_complete') {
    if (!state) return true
    const completed = Object.keys(state.daily).some(d => {
      if (d >= date) return false
      const dayData = state.daily[d]
      const status = dayData?.[task.id]
      return status === 'completed' || (status && !isNaN(Number(status)) && Number(status) > 0)
    })
    return !completed
  }
  if (task.type === 'daily' || task.type === 'recurring') return true
  if (task.type === 'weekly') {
    const day = new Date(date).getDay()
    return (task.weekDays || []).includes(day)
  }
  if (task.type === 'monthly') {
    const day = new Date(date).getDate()
    return (task.monthDays || []).includes(day)
  }
  return false
}

// Pure helpers
export function getActiveTasks(state, date) {
  return state.tasks
    .filter(t => !t.parentId)
    .filter(t => isTaskActiveOnDate(t, date, state))
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

export function getFailedTasks(state, date) {
  const day = state.daily[date]
  if (!day) return []
  return state.tasks.filter(t => {
    if (t.parentId) return false
    const status = day[t.id]
    if (status === 'failed') return true
    if (status === '0') return true
    return false
  })
}

export function getCompletedTasks(state, date) {
  const day = state.daily[date]
  if (!day) return []
  return state.tasks.filter(t => {
    if (t.parentId) return false
    const subs = getSubtasks(state, t.id)
    if (subs.length) {
      return subs.every(s => {
        const st = getSubtaskStatus(state, date, t.id, s.id)
        return st === 'completed' || (st && !isNaN(Number(st)) && Number(st) > 0)
      })
    }
    const status = day[t.id]
    if (status === 'completed') return true
    if (status && !isNaN(Number(status)) && Number(status) > 0) return true
    return false
  })
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

export function getActiveDate() {
  return todayStr()
}

export function setActiveDate(date) {
  localStorage.setItem('minhaj-active-date', date)
}
