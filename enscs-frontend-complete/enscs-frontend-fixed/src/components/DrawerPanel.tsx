import { X } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function DrawerPanel({ open, onClose, title, subtitle, width = 'max-w-lg', children, footer }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) { document.addEventListener('keydown', handler); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />

      {/* Panel */}
      <div className={`fixed right-0 top-0 bottom-0 z-50 w-full ${width} bg-white shadow-modal flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-primary">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="ml-4 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-100 p-6">{footer}</div>
        )}
      </div>
    </>
  );
}
