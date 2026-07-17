import { useState } from 'react'
import { Plus, X, Edit3 } from 'lucide-react'
import { useStore } from '../store'

export default function SettingsPage() {
  const { state, dispatch } = useStore()
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [showPenaltyForm, setShowPenaltyForm] = useState(false)
  const [editGroup, setEditGroup] = useState(null)
  const [tab, setTab] = useState('groups')

  return (
    <div className="page">
      <h1 className="page-title">الإعدادات</h1>

      <div className="toggle-group" style={{ marginBottom: 16 }}>
        <button className={`toggle-btn${tab === 'groups' ? ' active' : ''}`} onClick={() => setTab('groups')}>المجموعات</button>
        <button className={`toggle-btn${tab === 'penalties' ? ' active' : ''}`} onClick={() => setTab('penalties')}>العقوبات</button>
        <button className={`toggle-btn${tab === 'data' ? ' active' : ''}`} onClick={() => setTab('data')}>البيانات</button>
      </div>

      {tab === 'groups' && (
        <div className="settings-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 className="settings-title" style={{ margin: 0 }}>مجموعات المهام</h3>
            <button onClick={() => { setEditGroup(null); setShowGroupForm(true) }} style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={14} /> إضافة
            </button>
          </div>
          {state.groups.length === 0 && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>لا توجد مجموعات. أضف مجموعة جديدة</p>}
          {state.groups.map(g => (
            <div key={g.id} className="settings-item">
              <div className="color-dot" style={{ background: g.color }} />
              <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{g.name}</span>
              <button onClick={() => { setEditGroup(g); setShowGroupForm(true) }} style={{ color: 'var(--text-secondary)', padding: 4 }}>
                <Edit3 size={14} />
              </button>
              <button onClick={() => dispatch({ type: 'DEL_GROUP', id: g.id })} style={{ color: 'var(--danger)', padding: 4 }}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'penalties' && (
        <div className="settings-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 className="settings-title" style={{ margin: 0 }}>العقوبات الافتراضية</h3>
            <button onClick={() => setShowPenaltyForm(true)} style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={14} /> إضافة
            </button>
          </div>
          {state.penalties.length === 0 && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>لا توجد عقوبات. أضف عقوبات من هنا لتظهر في قوائم الاختيار</p>}
          {state.penalties.map(p => (
            <div key={p.id} className="settings-item">
              <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{p.name}</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{p.unit}{p.isMonetary ? ' 💰' : ''}</span>
              <button onClick={() => dispatch({ type: 'DEL_PENALTY', id: p.id })} style={{ color: 'var(--danger)', padding: 4 }}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'data' && (
        <div className="settings-section">
          <h3 className="settings-title">إدارة البيانات</h3>
          <button className="btn btn-secondary" style={{ width: '100%', marginBottom: 8 }} onClick={() => {
            const data = localStorage.getItem('minhaj-data')
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = `minhaj-backup-${new Date().toISOString().slice(0, 10)}.json`
            a.click(); URL.revokeObjectURL(url)
          }}>
            📥 تصدير البيانات
          </button>
          <button className="btn btn-danger" style={{ width: '100%' }} onClick={() => {
            if (confirm('هل أنت متأكد من حذف جميع البيانات؟')) {
              localStorage.removeItem('minhaj-data')
              window.location.reload()
            }
          }}>
            🗑️ حذف جميع البيانات
          </button>
        </div>
      )}

      {showGroupForm && <GroupForm onClose={() => setShowGroupForm(false)} state={state} dispatch={dispatch} edit={editGroup} />}
      {showPenaltyForm && <PenaltyForm onClose={() => setShowPenaltyForm(false)} state={state} dispatch={dispatch} />}
    </div>
  )
}

function GroupForm({ onClose, state, dispatch, edit }) {
  const [name, setName] = useState(edit?.name || '')
  const [color, setColor] = useState(edit?.color || '#4A7C59')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    if (edit) {
      dispatch({ type: 'EDIT_GROUP', id: edit.id, name: name.trim(), color })
    } else {
      dispatch({ type: 'ADD_GROUP', name: name.trim(), color })
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 300 }}>
        <h3 className="modal-title">{edit ? 'تعديل مجموعة' : 'مجموعة جديدة'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>الاسم</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="اسم المجموعة" required />
          </div>
          <div className="form-group">
            <label>اللون</label>
            <input type="color" className="color-input" value={color} onChange={e => setColor(e.target.value)} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn btn-primary">{edit ? 'حفظ' : 'إضافة'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PenaltyForm({ onClose, state, dispatch }) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [isMonetary, setIsMonetary] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !unit.trim()) return
    dispatch({
      type: 'ADD_PENALTY',
      name: name.trim(),
      type: isMonetary ? 'donation' : 'custom',
      unit: unit.trim(),
      isMonetary,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 300 }}>
        <h3 className="modal-title">عقوبة جديدة</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>اسم العقوبة</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: تمرين ضغط" required />
          </div>
          <div className="form-group">
            <label>الوحدة</label>
            <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="مثال: ضغطة, دج, يوم" required />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)', marginBottom: 16, cursor: 'pointer' }}>
            <input type="checkbox" checked={isMonetary} onChange={e => setIsMonetary(e.target.checked)} style={{ width: 'auto' }} />
            عقوبة مالية (تضرب تلقائياً)
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn btn-primary">إضافة</button>
          </div>
        </form>
      </div>
    </div>
  )
}
