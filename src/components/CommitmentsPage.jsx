import { useState } from 'react'
import { Plus, AlertTriangle, X, GripVertical, ChevronRight, Edit3 } from 'lucide-react'
import { useStore, getActiveDate, setActiveDate } from '../store'
import ConfirmDialog from './ConfirmDialog'
import DayBar from './DayBar'

export default function CommitmentsPage() {
  const { state, dispatch } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editCommitment, setEditCommitment] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [confirmViolateId, setConfirmViolateId] = useState(null)
  const [violateNote, setViolateNote] = useState('')
  const [reorderMode, setReorderMode] = useState(false)
  const [logDate, setLogDate] = useState(getActiveDate)
  const [dragIndex, setDragIndex] = useState(null)
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [tab, setTab] = useState('commitments')
  const [selectedGroupId, setSelectedGroupId] = useState(null)

  const groups = state.commitmentGroups || []
  const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null
  const ungrouped = state.commitments.filter(c => !c.groupId || !groups.find(g => g.id === c.groupId))

  function getGroupCommitments(groupId) {
    return state.commitments.filter(c => c.groupId === groupId).sort((a, b) => a.order - b.order)
  }

  function reorderWithin(ids) {
    dispatch({ type: 'REORDER_COMMITMENTS', ids })
  }

  function handleDragStart(i) {
    setDragIndex(i)
  }

  function handleDragOver(e, i, ids) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) return
    const copy = [...ids]
    const dragged = copy.splice(dragIndex, 1)[0]
    copy.splice(i, 0, dragged)
    setDragIndex(i)
    reorderWithin(copy)
  }

  function handleDragEnd() {
    setDragIndex(null)
  }

  function handleViolate() {
    if (!confirmViolateId) return
    const c = state.commitments.find(cv => cv.id === confirmViolateId)
    if (!c) { setConfirmViolateId(null); return }
    dispatch({ type: 'VIOLATE_COMMITMENT', id: confirmViolateId })
    const penalty = state.penalties.find(p => p.id === c.penaltyId)
    const entry = {
      source: 'commitment', sourceId: c.id,
      penaltyText: penalty ? penalty.name : '',
      count: Number(c.penaltyCount),
      unit: penalty ? penalty.unit : '',
      isMonetary: c.isMonetary,
    }
    dispatch({ type: 'ADD_PENALTY_LOG', entry })
    dispatch({
      type: 'ADD_VIOLATION_LOG',
      date: getActiveDate(),
      entry: {
        commitmentId: c.id,
        commitmentText: c.text,
        note: violateNote.trim(),
        penaltyText: penalty ? penalty.name : '',
        count: Number(c.penaltyCount),
        unit: penalty ? penalty.unit : '',
        isMonetary: c.isMonetary,
      },
    })
    setConfirmViolateId(null)
    setViolateNote('')
  }

  function addGroup() {
    if (!newGroupName.trim()) return
    dispatch({ type: 'ADD_COMMITMENT_GROUP', name: newGroupName.trim() })
    setNewGroupName('')
    setShowGroupForm(false)
  }

  function handleDeleteGroup(g) {
    const hasChildren = state.commitments.some(c => c.groupId === g.id)
    if (hasChildren) {
      alert('لا يمكن حذف المجموعة لأنها تحتوي على التزامات. احذف أو انقل الالتزامات أولاً.')
      return
    }
    dispatch({ type: 'DEL_COMMITMENT_GROUP', id: g.id })
  }

  const log = [...state.violationLog].reverse().filter(e => e.date === logDate)

  const selectedTasks = selectedGroupId ? getGroupCommitments(selectedGroupId) : []

  return (
    <div className="page">
      <h1 className="page-title">الالتزامات</h1>

      {selectedGroupId ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <button onClick={() => { setSelectedGroupId(null); setReorderMode(false) }}
              style={{ padding: '4px 8px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              <ChevronRight size={16} style={{ verticalAlign: 'middle' }} /> العودة
            </button>
            <div style={{ width: 4, height: 20, background: selectedGroup?.color || 'var(--accent)', borderRadius: 2 }} />
            <span style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>
              {selectedGroup?.name || 'المجموعة'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button onClick={() => setReorderMode(r => !r)}
              style={{
                fontSize: 'var(--text-xs)', padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                background: reorderMode ? 'var(--primary)' : 'var(--bg-card)',
                color: reorderMode ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border)', fontWeight: 600,
              }}>
              {reorderMode ? 'إنهاء الترتيب' : 'ترتيب الالتزامات'}
            </button>
          </div>
          {selectedTasks.length === 0 ? (
            <div className="empty-state" style={{ margin: '24px 0' }}>
              <AlertTriangle size={48} />
              <p>لم تضف التزامات لهذه المجموعة بعد. أضف التزاماً جديداً من زر +</p>
            </div>
          ) : (
            selectedTasks.map((c, i) => renderCommitment(c, i, selectedTasks.map(x => x.id)))
          )}
          <button className="fab" onClick={() => setShowForm(true)}><Plus /></button>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', marginBottom: 12, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <button onClick={() => setTab('commitments')}
              style={{
                flex: 1, padding: '8px 12px', fontSize: 'var(--text-xs)', fontWeight: 700,
                background: tab === 'commitments' ? 'var(--primary)' : 'var(--bg-card)',
                color: tab === 'commitments' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
              }}>
              الالتزامات
            </button>
            <button onClick={() => setTab('log')}
              style={{
                flex: 1, padding: '8px 12px', fontSize: 'var(--text-xs)', fontWeight: 700,
                background: tab === 'log' ? 'var(--primary)' : 'var(--bg-card)',
                color: tab === 'log' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
              }}>
              سجل الخروقات
            </button>
          </div>

          {tab === 'commitments' ? (
            <>
              {ungrouped.length > 0 && (
                <div style={{
                  background: 'var(--warning-light)', border: '1px solid var(--warning)',
                  borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 12,
                  fontSize: 'var(--text-xs)', color: 'var(--warning)',
                }}>
                  يوجد {ungrouped.length} التزام (التزامات) بدون مجموعة. قم بتعديلها لتعيين مجموعة لها.
                </div>
              )}
              {groups.length === 0 ? (
                <div className="empty-state" style={{ margin: '24px 0' }}>
                  <AlertTriangle size={48} />
                  <p>لم تنشئ أي مجموعات بعد. المجموعات تنظم التزاماتك — أضف مجموعتك الأولى من زر +</p>
                </div>
              ) : (
                groups.map(g => {
                  const count = state.commitments.filter(c => c.groupId === g.id).length
                  return (
                    <div key={g.id} className="task-card" onClick={() => setSelectedGroupId(g.id)} style={{ cursor: 'pointer', marginBottom: 6 }}>
                      <div className="task-card-header">
                        <div className="task-color-bar" style={{ background: g.color || 'var(--accent)' }} />
                        <div className="task-content">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{g.name}</span>
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                                {count}
                              </span>
                              <button onClick={e => { e.stopPropagation(); handleDeleteGroup(g) }}
                                style={{ padding: 2, color: 'var(--danger)', fontSize: 'var(--text-xs)' }}>
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div style={{ marginTop: 8 }}>
                {showGroupForm ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input type="text" placeholder="اسم المجموعة" value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addGroup() }}
                      style={{ flex: 1, padding: '6px 8px', fontSize: 'var(--text-xs)' }} />
                    <button className="btn btn-primary" onClick={addGroup} style={{ padding: '6px 10px', fontSize: 'var(--text-xs)' }}>إضافة</button>
                    <button className="btn btn-secondary" onClick={() => { setShowGroupForm(false); setNewGroupName('') }}
                      style={{ padding: '6px 10px', fontSize: 'var(--text-xs)' }}>إلغاء</button>
                  </div>
                ) : (
                  <button onClick={() => setShowGroupForm(true)}
                    style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', padding: '8px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={14} /> إضافة مجموعة
                  </button>
                )}
              </div>
              <button className="fab" onClick={() => setShowForm(true)}><Plus /></button>
            </>
          ) : (
            <>
              <DayBar date={logDate} onChange={setLogDate} />
              <div style={{ height: 12 }} />
              {log.length === 0 ? (
                <div className="empty-state" style={{ marginTop: 24 }}>
                  <p>لم تسجل خروقات في هذا اليوم. اختر يوماً آخر أو حافظ على هذا المستوى</p>
                </div>
              ) : log.map((entry, i) => (
                <div key={entry.id || i} className="penalty-card" style={{ padding: '10px 12px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{entry.commitmentText}</div>
                    {entry.note && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>{entry.note}</div>}
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', marginTop: 4 }}>
                      {entry.penaltyText} {entry.count} {entry.unit}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          message="هل أنت متأكد من حذف هذا الالتزام؟"
          onConfirm={() => { dispatch({ type: 'DEL_COMMITMENT', id: confirmDeleteId }); setConfirmDeleteId(null) }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {confirmViolateId && (
        <div className="modal-overlay" onClick={() => setConfirmViolateId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <AlertTriangle size={32} style={{ color: 'var(--danger)', marginBottom: 12, display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
            <p style={{ textAlign: 'center', marginBottom: 12, fontSize: 'var(--text-sm)' }}>هل أنت متأكد من خرق هذا الالتزام؟</p>
            <div className="form-group">
              <label style={{ fontSize: 'var(--text-xs)' }}>ملاحظة (اختياري)</label>
              <textarea rows={2} value={violateNote} onChange={e => setViolateNote(e.target.value)}
                placeholder="سبب الخرق..." style={{ fontSize: 'var(--text-xs)' }} />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmViolateId(null)}>إلغاء</button>
              <button className="btn btn-danger" onClick={handleViolate}>تأكيد الخرق</button>
            </div>
          </div>
        </div>
      )}

      {showForm && <CommitmentForm onClose={() => setShowForm(false)} state={state} dispatch={dispatch} groups={groups} defaultGroupId={selectedGroupId} />}
      {editCommitment && <CommitmentForm onClose={() => setEditCommitment(null)} state={state} dispatch={dispatch} groups={groups} edit={editCommitment} />}
    </div>
  )

  function renderCommitment(c, i, ids) {
    const penalty = state.penalties.find(p => p.id === c.penaltyId)
    const isDrag = reorderMode && dragIndex === i
    return (
      <div key={c.id} draggable={reorderMode}
        onDragStart={() => handleDragStart(i)}
        onDragOver={e => handleDragOver(e, i, ids)}
        onDragEnd={handleDragEnd}
        style={{ opacity: isDrag ? 0.4 : 1, transition: 'opacity .15s' }}
      >
        <div className="commitment-card" style={reorderMode ? { cursor: 'grab', userSelect: 'none' } : {}}>
          {reorderMode && <GripVertical size={14} style={{ display: 'block', marginBottom: 4, color: 'var(--text-muted)' }} />}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="commitment-text" style={{ flex: 1 }}>{c.text}</div>
            <button onClick={() => setEditCommitment(c)} style={{ padding: 2, color: 'var(--text-muted)', flexShrink: 0 }}>
              <Edit3 size={14} />
            </button>
          </div>
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
            <button className="btn btn-danger" onClick={() => { setConfirmViolateId(c.id); setViolateNote('') }} style={{ flex: 1, padding: 8, fontSize: 'var(--text-xs)' }}>
              🚫 خرق الالتزام
            </button>
            <button className="btn btn-secondary" onClick={() => setConfirmDeleteId(c.id)} style={{ padding: '8px 12px', fontSize: 'var(--text-xs)' }}>
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    )
  }
}

function CommitmentForm({ onClose, state, dispatch, groups, edit, defaultGroupId }) {
  const [text, setText] = useState(edit?.text || '')
  const [penaltyId, setPenaltyId] = useState(edit?.penaltyId || '')
  const [penaltyCount, setPenaltyCount] = useState(edit?.penaltyCount || 1)
  const [note, setNote] = useState(edit?.note || '')
  const [isMonetary, setIsMonetary] = useState(edit?.isMonetary || false)
  const [groupId, setGroupId] = useState(edit?.groupId || defaultGroupId || '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    if (!groupId) { alert('يجب اختيار مجموعة للالتزام.'); return }
    if (edit) {
      dispatch({
        type: 'EDIT_COMMITMENT',
        id: edit.id,
        updates: {
          text: text.trim(),
          penaltyId: penaltyId || null,
          penaltyCount: Number(penaltyCount),
          note: note.trim(),
          isMonetary,
          groupId,
        },
      })
    } else {
      const p = state.penalties.find(pn => pn.id === penaltyId)
      dispatch({
        type: 'ADD_COMMITMENT',
        text: text.trim(),
        penaltyId: penaltyId || null,
        penaltyCount: Number(penaltyCount),
        note: note.trim(),
        isMonetary: p ? p.isMonetary : isMonetary,
        groupId,
      })
    }
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="modal-title" style={{ margin: 0 }}>{edit ? 'تعديل الالتزام' : 'التزام جديد'}</h3>
          <button onClick={onClose} style={{ padding: 4, color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>نص الالتزام</label>
            <textarea rows={2} value={text} onChange={e => setText(e.target.value)} placeholder="مثال: لا أستعمل تطبيق تيك توك" required />
          </div>
          <div className="form-group">
            <label>المجموعة</label>
            {groups.length === 0 ? (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)' }}>أضف مجموعة أولاً من صفحة الالتزامات</p>
            ) : (
              <select value={groupId} onChange={e => setGroupId(e.target.value)} required>
                <option value="">اختر مجموعة</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            )}
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
            <button type="submit" className="btn btn-primary">{edit ? 'حفظ' : 'إضافة'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
