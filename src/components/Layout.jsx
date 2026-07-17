import { NavLink, Outlet } from 'react-router-dom'
import { ListTodo, CheckCircle, XCircle, ScrollText, AlertTriangle, Settings } from 'lucide-react'

const nav = [
  { to: '/', label: 'المهام', icon: ListTodo },
  { to: '/completed', label: 'التامة', icon: CheckCircle },
  { to: '/failed', label: 'الفاشلة', icon: XCircle },
  { to: '/commitments', label: 'الالتزامات', icon: ScrollText },
  { to: '/penalties', label: 'العقوبات', icon: AlertTriangle },
]

export default function Layout() {
  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
      <nav className="bottom-nav">
        {nav.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}>
            <n.icon />
            <span>{n.label}</span>
          </NavLink>
        ))}
        <NavLink to="/settings" className={({ isActive }) => `nav-btn${isActive ? ' active' : ''}`}>
          <Settings />
          <span>الإعدادات</span>
        </NavLink>
      </nav>
    </>
  )
}
