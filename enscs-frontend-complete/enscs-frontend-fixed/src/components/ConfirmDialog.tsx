import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  extra?: React.ReactNode;          // SPRINT 1 — extra content (e.g. reason textarea)
  confirmDisabled?: boolean;        // SPRINT 1 — disable confirm button
}

export function ConfirmDialog({
  open, title, description, confirmLabel = 'Confirm',
  variant = 'danger', onConfirm, onCancel, extra, confirmDisabled = false,
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-card shadow-modal w-full max-w-md animate-scale-in p-6">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${variant === 'danger' ? 'bg-danger/10' : 'bg-warning/10'}`}>
          <AlertTriangle size={22} className={variant === 'danger' ? 'text-danger' : 'text-warning'} />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">{description}</p>
        {extra && <div className="mb-4">{extra}</div>}
        <div className="flex gap-3 justify-end mt-4">
          <button onClick={onCancel} className="btn-outline text-sm px-4 py-2">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`btn text-sm px-4 py-2 text-white disabled:opacity-40 disabled:cursor-not-allowed ${variant === 'danger' ? 'bg-danger hover:bg-red-700' : 'bg-warning hover:bg-orange-600'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
