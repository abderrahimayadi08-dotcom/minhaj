import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { todayStr, addDays, daysBetween, fmtDate } from '../store'

export default function DayBar({ date, onChange }) {
  const scrollRef = useRef(null)

  const today = todayStr()
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 3))

  const scrollTo = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 120, behavior: 'smooth' })
  }

  const goToday = () => onChange(today)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button className="day-nav-btn" onClick={() => scrollTo(1)}><ChevronRight /></button>
        <div className="day-bar" ref={scrollRef}>
          {days.map(d => {
            const daysFromNow = daysBetween(today, d)
            let label = ''
            if (daysFromNow === 0) label = 'اليوم'
            else if (daysFromNow === 1) label = 'غداً'
            else if (daysFromNow === -1) label = 'أمس'
            else if (daysFromNow > 1 && daysFromNow < 7) label = `بعد ${daysFromNow} أيام`
            else if (daysFromNow < -1 && daysFromNow > -7) label = `قبل ${Math.abs(daysFromNow)} أيام`
            else label = ''
            return (
              <button key={d} className={`day-btn${d === date ? ' active' : ''}${d === today ? ' today' : ''}`} onClick={() => onChange(d)}>
                <span className="day-num">{new Date(d + 'T12:00:00').getDate()}</span>
                <span>{label || new Date(d + 'T12:00:00').toLocaleDateString('ar-SA', { weekday: 'short' })}</span>
              </button>
            )
          })}
        </div>
        <button className="day-nav-btn" onClick={() => scrollTo(-1)}><ChevronLeft /></button>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
        <button className="day-nav-btn" onClick={goToday} style={{ fontSize: 'var(--text-xs)', padding: '4px 10px', borderRadius: 'var(--radius-sm)' }}>اليوم</button>
        <input type="date" className="date-input" value={date} onChange={e => onChange(e.target.value)} />
      </div>
    </div>
  )
}
