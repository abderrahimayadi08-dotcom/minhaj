import { useState } from 'react'
import { useStore } from '../store'
import { X } from 'lucide-react'

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export default function TaskForm({ onClose, parentId, defaultGroupId, defaultPriority, editTask }) {
  const { state, dispatch } = useStore()
  const [text, setText] = useState(editTask?.text || '')
  const [groupId, setGroupId] = useState(editTask?.groupId || defaultGroupId || (state.groups[0]?.id || ''))
  const [priority, setPriority] = useState(editTask?.priority || defaultPriority || 1)
  const [type, setType] = useState(editTask?.type === 'recurring' ? 'daily' : (editTask?.type || 'temporary'))
  const [startDate, setStartDate] = useState(editTask?.startDate || new Date().toISOString().slice(0, 10))
  const [deadline, setDeadline] = useState(editTask?.deadline || '')
  const [weekDays, setWeekDays] = useState(editTask?.weekDays || [])
  const [monthDays, setMonthDays] = useState(editTask?.monthDays || [])
  const [penaltyId, setPenaltyId] = useState(editTask?.penaltyId || '')
  const [penaltyCounts, setPenaltyCounts] = useState(editTask?.penaltyCounts || {})
  const [penaltyIds, setPenaltyIds] = useState(editTask?.penaltyIds || (editTask?.penaltyId ? [editTask.penaltyId] : []))
  const [showInCompleted, setShowInCompleted] = useState(editTask?.showInCompleted || false)
  const [showInFailed, setShowInFailed] = useState(editTask?.showInFailed || false)
  const [note, setNote] = useState(editTask?.note || '')

  function toggleDay(d) {
    setWeekDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  function addMonthDay(d) {
    const n = Number(d)
    if (!n || n < 1 || n > 31) return
    if (monthDays.includes(n)) return
    setMonthDays([...monthDays, n].sort((a, b) => a - b))
  }

  function removeMonthDay(d) {
    setMonthDays(prev => prev.filter(x => x !== d))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    const activePenaltyIds = penaltyIds.filter(Boolean)
    const activePenaltyCounts = {}
    activePenaltyIds.forEach(id => { activePenaltyCounts[id] = Number(penaltyCounts[id] || 1) })
    const common = {
      text: text.trim(),
      groupId,
      priority,
      type,
      startDate,
      deadline: deadline || null,
      penaltyId: activePenaltyIds[0] || null,
      penaltyIds: activePenaltyIds,
      penaltyCounts: activePenaltyCounts,
      penaltyCount: activePenaltyIds.length ? Number(activePenaltyCounts[activePenaltyIds[0]] || 1) : 0,
      showInCompleted,
      showInFailed,
      weekDays: type === 'weekly' ? weekDays : [],
      monthDays: type === 'monthly' ? monthDays : [],
      note: note.trim() || null,
    }
    if (editTask) {
      dispatch({ type: 'EDIT_TASK', id: editTask.id, updates: common })
    } else {
      dispatch({ type: 'ADD_TASK', task: { ...common, order: state.tasks.filter(t => !t.parentId).length }, parentId: parentId || null })
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="modal-title" style={{ margin: 0 }}>{editTask ? 'تعديل المهمة' : parentId ? 'مهمة ثانوية جديدة' : 'مهمة جديدة'}</h3>
          <button onClick={onClose} style={{ padding: 4, color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>نص المهمة</label>
            <textarea rows={2} value={text} onChange={e => setText(e.target.value)} placeholder="أدخل نص المهمة..." required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>المجموعة</label>
              <select value={groupId} onChange={e => setGroupId(e.target.value)}>
                {state.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>الأهمية</label>
              <div className="toggle-group">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" className={`toggle-btn${priority === n ? ' active' : ''}`} onClick={() => setPriority(n)}>
                    {'★'.repeat(n)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>النوع</label>
            <div className="toggle-group" style={{ flexWrap: 'wrap' }}>
              <button type="button" className={`toggle-btn${type === 'temporary' ? ' active' : ''}`} onClick={() => setType('temporary')}>مؤقتة</button>
              <button type="button" className={`toggle-btn${type === 'daily' ? ' active' : ''}`} onClick={() => setType('daily')}>يومي</button>
              <button type="button" className={`toggle-btn${type === 'until_complete' ? ' active' : ''}`} onClick={() => setType('until_complete')}>تظهر حتى التمام</button>
              <button type="button" className={`toggle-btn${type === 'weekly' ? ' active' : ''}`} onClick={() => setType('weekly')}>أسبوعي</button>
              <button type="button" className={`toggle-btn${type === 'monthly' ? ' active' : ''}`} onClick={() => setType('monthly')}>شهري</button>
            </div>
          </div>

          {type === 'weekly' && (
            <div className="form-group">
              <label>أيام الأسبوع</label>
              <div className="toggle-group" style={{ flexWrap: 'wrap' }}>
                {DAY_NAMES.map((name, i) => (
                  <button key={i} type="button" className={`toggle-btn${weekDays.includes(i) ? ' active' : ''}`} onClick={() => toggleDay(i)} style={{ flex: 1, minWidth: 60 }}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === 'monthly' && (
            <div className="form-group">
              <label>أيام الشهر</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input type="number" min={1} max={31} placeholder="رقم اليوم" id="monthDayInput" style={{ flex: 1 }} />
                <button type="button" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }} onClick={() => { const inp = document.getElementById('monthDayInput'); addMonthDay(inp.value); inp.value = '' }}>إضافة</button>
              </div>
              {monthDays.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {monthDays.map(d => (
                    <button key={d} type="button" onClick={() => removeMonthDay(d)} style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {d} ✕
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>تاريخ البداية</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>آخر أجل (اختياري)</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>عقوبة عدم التنفيذ (اختياري)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {state.penalties.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: penaltyIds.includes(p.id) ? 'var(--primary-light)' : 'var(--bg)', padding: '6px 8px', borderRadius: 'var(--radius)', border: penaltyIds.includes(p.id) ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', cursor: 'pointer', flex: 1 }}>
                    <input type="checkbox" checked={penaltyIds.includes(p.id)} onChange={e => {
                      setPenaltyIds(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id))
                    }} style={{ width: 'auto' }} />
                    {p.name} ({p.unit})
                  </label>
                  {penaltyIds.includes(p.id) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="number" min={1} value={penaltyCounts[p.id] || 1} onChange={e => setPenaltyCounts(prev => ({ ...prev, [p.id]: Number(e.target.value) || 1 }))} style={{ width: 50, textAlign: 'center' }} />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.unit}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>ملاحظة (اختياري)</label>
            <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="أدخل ملاحظة..." />
          </div>
          <div className="form-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
              <input type="checkbox" checked={showInCompleted} onChange={e => setShowInCompleted(e.target.checked)} style={{ width: 'auto' }} />
              أظهر في المهام التامة
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
              <input type="checkbox" checked={showInFailed} onChange={e => setShowInFailed(e.target.checked)} style={{ width: 'auto' }} />
              أظهر في المهام الفاشلة
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn btn-primary">{editTask ? 'حفظ' : 'إضافة'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
