import { useState } from 'react'
import { Plus, AlertTriangle, X } from 'lucide-react'
import { useStore } from '../store'
import ConfirmDialog from './ConfirmDialog'

export default function CommitmentsPage() {
  const { state, dispatch } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [confirmId, setConfirmId] = useState(null)

  return (
    <div className="page">
      <h1 className="page-title">الالتزامات</h1>
      {state.commitments.length === 0 ? (
        <div className="empty-state">
          <AlertTriangle size={48} />
          <p>لا توجد التزامات. أضف التزاماً جديداً</p>
        </div>
      ) : state.commitments.map(c => {
        const penalty = state.penalties.find(p => p.id === c.penaltyId)
        return (
          <div key={c.id} className="commitment-card">
            <div className="commitment-text">{c.text}</div>
            {penalty && (
              <div className="commitment-penalty">
                {c.isMonetary
                  ? `${penalty.name} ب ${Number(c.penaltyCount) * (c.violations + 1)} ${penalty.unit}`
                  : `${penalty.name} ${penalty.unit} x ${c.violations + 1}`
                }
              </div>
            )}
            {c.note && <div className="commitment-note">{c.note}</div>}
            {c.violations > 0 && <div className="commitment-violations">عدد الخروقات: {c.violations}</div>}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button className="btn btn-danger" onClick={() => setConfirmId(c.id)} style={{ flex: 1, padding: 8, fontSize: 'var(--text-xs)' }}>
                🚫 خرق الالتزام
              </button>
              <button className="btn btn-secondary" onClick={() => dispatch({ type: 'DEL_COMMITMENT', id: c.id })} style={{ padding: '8px 12px', fontSize: 'var(--text-xs)' }}>
                <X size={14} />
              </button>
            </div>
          </div>
        )
      })}
      <button className="fab" onClick={() => setShowForm(true)}><Plus /></button>

      {confirmId && (
        <ConfirmDialog
          message="هل أنت متأكد من خرق هذا الالتزام؟"
          onConfirm={() => {
            dispatch({ type: 'VIOLATE_COMMITMENT', id: confirmId })
            const c = state.commitments.find(cv => cv.id === confirmId)
            if (c) {
              const penalty = state.penalties.find(p => p.id === c.penaltyId)
              dispatch({
                type: 'ADD_PENALTY_LOG',
                entry: {
                  source: 'commitment',
                  sourceId: c.id,
                  penaltyText: penalty ? penalty.name : '',
                  count: Number(c.penaltyCount),
                  unit: penalty ? penalty.unit : '',
                  isMonetary: c.isMonetary,
                },
              })
            }
            setConfirmId(null)
          }}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {showForm && <CommitmentForm onClose={() => setShowForm(false)} state={state} dispatch={dispatch} />}
    </div>
  )
}

function CommitmentForm({ onClose, state, dispatch }) {
  const [text, setText] = useState('')
  const [penaltyId, setPenaltyId] = useState('')
  const [penaltyCount, setPenaltyCount] = useState(1)
  const [note, setNote] = useState('')
  const [isMonetary, setIsMonetary] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    const p = state.penalties.find(pn => pn.id === penaltyId)
    dispatch({
      type: 'ADD_COMMITMENT',
      text: text.trim(),
      penaltyId: penaltyId || null,
      penaltyCount: Number(penaltyCount),
      note: note.trim(),
      isMonetary: p ? p.isMonetary : isMonetary,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="modal-title" style={{ margin: 0 }}>التزام جديد</h3>
          <button onClick={onClose} style={{ padding: 4, color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>نص الالتزام</label>
            <textarea rows={2} value={text} onChange={e => setText(e.target.value)} placeholder="مثال: لا أستعمل تطبيق تيك توك" required />
          </div>
          <div className="form-group">
            <label>عقوبة ترك الالتزام</label>
            <div className="form-row">
              <select value={penaltyId} onChange={e => {
                setPenaltyId(e.target.value)
                const p = state.penalties.find(pn => pn.id === e.target.value)
                if (p) setIsMonetary(p.isMonetary)
              }}>
                <option value="">بدون</option>
                {state.penalties.map(p => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
              </select>
              {penaltyId && <input type="number" min={1} value={penaltyCount} onChange={e => setPenaltyCount(e.target.value)} style={{ width: 70 }} />}
            </div>
          </div>
          <div className="form-group">
            <label>ملاحظة</label>
            <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} />
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
