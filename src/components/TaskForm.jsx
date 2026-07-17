import { useState } from 'react'
import { useStore } from '../store'
import { X } from 'lucide-react'

export default function TaskForm({ onClose, parentId, defaultGroupId, defaultPriority }) {
  const { state, dispatch } = useStore()
  const [text, setText] = useState('')
  const [groupId, setGroupId] = useState(defaultGroupId || (state.groups[0]?.id || ''))
  const [priority, setPriority] = useState(defaultPriority || 1)
  const [type, setType] = useState('temporary')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [deadline, setDeadline] = useState('')
  const [penaltyId, setPenaltyId] = useState('')
  const [penaltyCount, setPenaltyCount] = useState(1)
  const [showInCompleted, setShowInCompleted] = useState(false)
  const [showInFailed, setShowInFailed] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    dispatch({
      type: 'ADD_TASK',
      task: {
        text: text.trim(),
        groupId,
        priority,
        type,
        startDate,
        deadline: deadline || null,
        penaltyId: penaltyId || null,
        penaltyCount: penaltyId ? Number(penaltyCount) : 0,
        showInCompleted,
        showInFailed,
        order: state.tasks.filter(t => !t.parentId).length,
      },
      parentId: parentId || null,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="modal-title" style={{ margin: 0 }}>{parentId ? 'مهمة ثانوية جديدة' : 'مهمة جديدة'}</h3>
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
            <div className="toggle-group">
              <button type="button" className={`toggle-btn${type === 'temporary' ? ' active' : ''}`} onClick={() => setType('temporary')}>مؤقتة (يوم واحد)</button>
              <button type="button" className={`toggle-btn${type === 'recurring' ? ' active' : ''}`} onClick={() => setType('recurring')}>متكررة (يومياً)</button>
            </div>
          </div>
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
            <div className="form-row">
              <select value={penaltyId} onChange={e => setPenaltyId(e.target.value)}>
                <option value="">بدون عقوبة</option>
                {state.penalties.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
              </select>
              {penaltyId && (
                <input type="number" min={1} value={penaltyCount} onChange={e => setPenaltyCount(e.target.value)} style={{ width: 70 }} />
              )}
            </div>
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
            <button type="submit" className="btn btn-primary">إضافة</button>
          </div>
        </form>
      </div>
    </div>
  )
}
