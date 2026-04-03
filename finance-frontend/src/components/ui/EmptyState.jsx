import { AlertTriangle } from 'lucide-react';

export function EmptyState({ message = 'No data found', icon: Icon = AlertTriangle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3"
      style={{ color: 'var(--color-surface-500)' }}
    >
      <Icon size={40} strokeWidth={1.5} />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: 'var(--color-surface-300)' }}>{message}</p>
      <div className="flex justify-end gap-3">
        <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
