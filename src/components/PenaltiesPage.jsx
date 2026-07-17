import { Trash2 } from 'lucide-react'
import { useStore } from '../store'

export default function PenaltiesPage() {
  const { state, dispatch } = useStore()
  const log = [...state.penaltyLog].reverse()

  // Aggregate penalties
  const aggregated = {}
  log.forEach(entry => {
    const key = entry.penaltyText + (entry.isMonetary ? '_mon' : '')
    if (!aggregated[key]) {
      aggregated[key] = { text: entry.penaltyText, count: 0, unit: entry.unit, isMonetary: entry.isMonetary }
    }
    aggregated[key].count += entry.count
  })

  const hasEntries = Object.keys(aggregated).length > 0

  function fmtEntry(text, count, unit, monetary) {
    return monetary ? `${text} ب ${count} ${unit}` : `${text} ${unit} x ${count}`
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">العقوبات</h1>
        {log.length > 0 && (
          <button className="btn btn-danger" onClick={() => dispatch({ type: 'CLEAR_PENALTY_LOG' })} style={{ padding: '6px 10px', fontSize: 'var(--text-xs)' }}>
            <Trash2 size={14} /> مسح
          </button>
        )}
      </div>

      {!hasEntries ? (
        <div className="empty-state">
          <p>لا توجد عقوبات متراكمة</p>
        </div>
      ) : (
        <>
          <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 8 }}>العقوبات المتراكمة</h3>
          {Object.values(aggregated).map((item, i) => (
            <div key={i} className="penalty-card">
              <span className="penalty-text">{fmtEntry(item.text, item.count, item.unit, item.isMonetary)}</span>
            </div>
          ))}
        </>
      )}

      {log.length > 0 && (
        <>
          <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 8, marginTop: 20 }}>السجل</h3>
          {log.slice(0, 50).map((entry, i) => (
            <div key={entry.id || i} className="penalty-card" style={{ padding: '8px 10px' }}>
              <div>
                <span className="penalty-text">{fmtEntry(entry.penaltyText, entry.count, entry.unit, entry.isMonetary)}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginRight: 8 }}>{entry.date}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
