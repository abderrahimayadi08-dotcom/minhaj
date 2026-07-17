import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <AlertTriangle size={32} style={{ color: 'var(--danger)', marginBottom: 12 }} />
        <p className="confirm-text">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>إلغاء</button>
          <button className="btn btn-danger" onClick={onConfirm}>تأكيد</button>
        </div>
      </div>
    </div>
  )
}
