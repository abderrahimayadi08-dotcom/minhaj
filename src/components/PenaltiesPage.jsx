import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useStore, getActiveDate, setActiveDate } from '../store'
import DayBar from './DayBar'

export default function PenaltiesPage() {
  const { state, dispatch } = useStore()
  const [tab, setTab] = useState('accumulated')
  const [logDate, setLogDate] = useState(getActiveDate)
  const [reduceVals, setReduceVals] = useState({})

  const allLog = [...state.penaltyLog].reverse()

  const aggregated = {}
  state.penaltyLog.forEach(entry => {
    const key = entry.penaltyText + (entry.isMonetary ? '_mon' : '')
    if (!aggregated[key]) {
      aggregated[key] = { text: entry.penaltyText, count: 0, unit: entry.unit, isMonetary: entry.isMonetary }
    }
    aggregated[key].count += entry.count
  })
  state.penaltyReductions.forEach(red => {
    const key = red.text + (red.isMonetary ? '_mon' : '')
    if (aggregated[key]) {
      aggregated[key].count = Math.max(0, aggregated[key].count - red.count)
    }
  })

  const hasEntries = Object.keys(aggregated).length > 0

  const filteredLog = allLog.filter(e => e.date === logDate)

  function fmtLogDate(dateStr) {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
  }

  function handleReduce(key, text, isMonetary, maxCount) {
    const val = Number(reduceVals[key]) || 1
    const amount = Math.min(val, maxCount)
    if (amount <= 0) return
    if (!window.confirm(`هل أنت متأكد من تخفيض العقوبة بمقدار ${amount}؟`)) return
    dispatch({
      type: 'REDUCE_PENALTY',
      text,
      isMonetary,
      count: amount,
    })
    setReduceVals(prev => ({ ...prev, [key]: 1 }))
  }

  function handleIncrease(key, text, unit, isMonetary) {
    const val = Number(reduceVals[key]) || 1
    if (val <= 0) return
    if (!window.confirm(`هل أنت متأكد من زيادة العقوبة بمقدار ${val}؟`)) return
    dispatch({
      type: 'INCREASE_PENALTY',
      text,
      unit,
      isMonetary,
      count: val,
    })
    setReduceVals(prev => ({ ...prev, [key]: 1 }))
  }

  return (
    <div className="page">
      <h1 className="page-title">العقوبات</h1>

      <div style={{ display: 'flex', marginBottom: 12, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <button onClick={() => setTab('accumulated')}
          style={{
            flex: 1, padding: '8px 12px', fontSize: 'var(--text-xs)', fontWeight: 700,
            background: tab === 'accumulated' ? 'var(--primary)' : 'var(--bg-card)',
            color: tab === 'accumulated' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
          }}>
          العقوبات المتراكمة
        </button>
        <button onClick={() => setTab('log')}
          style={{
            flex: 1, padding: '8px 12px', fontSize: 'var(--text-xs)', fontWeight: 700,
            background: tab === 'log' ? 'var(--primary)' : 'var(--bg-card)',
            color: tab === 'log' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
          }}>
          السجل
        </button>
      </div>

      {tab === 'accumulated' ? (
        !hasEntries ? (
          <div className="empty-state">
            <p>لا توجد عقوبات متراكمة. العقوبات تظهر هنا عندما تفشل في مهمة أو تخالف التزاماً</p>
          </div>
        ) : (
          Object.entries(aggregated).map(([key, item]) => (
            <div key={key} className="penalty-card" style={{ padding: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span className="penalty-text">{item.text}</span>
                <span><span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--danger)' }}>{item.count}</span> {item.unit}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  min={1}
                  value={reduceVals[key] ?? 1}
                  onChange={e => setReduceVals(prev => ({ ...prev, [key]: Math.max(1, Number(e.target.value)) }))}
                  style={{ width: 44, padding: '2px 4px', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', textAlign: 'center' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => handleReduce(key, item.text, item.isMonetary, item.count)}
                  style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}
                  disabled={item.count <= 0}
                >
                  تخفيض
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleIncrease(key, item.text, item.unit, item.isMonetary)}
                  style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}
                >
                  زيادة
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`حذف جميع عقوبات "${item.text}"؟`)) {
                      dispatch({ type: 'DELETE_PENALTY_LOG_BY_TEXT', text: item.text, isMonetary: item.isMonetary })
                    }
                  }}
                  style={{ padding: 6, color: 'var(--danger)', flexShrink: 0 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )
      ) : (
        <>
          <DayBar date={logDate} onChange={setLogDate} />
          <div style={{ height: 12 }} />
          {filteredLog.length === 0 ? (
            <div className="empty-state" style={{ marginTop: 24 }}>
              <p>لم تسجل أي عقوبات في هذا اليوم. اختر يوماً آخر من شريط التاريخ</p>
            </div>
          ) : filteredLog.slice(0, 50).map((entry, i) => (
            <div key={entry.id || i} className="penalty-card" style={{ padding: '8px 10px' }}>
              <span className="penalty-text">{entry.penaltyText} {entry.count} {entry.unit}</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtLogDate(entry.date)}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
