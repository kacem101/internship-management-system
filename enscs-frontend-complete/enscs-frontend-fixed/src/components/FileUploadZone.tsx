import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { clsx } from 'clsx';

interface Props {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export function FileUploadZone({ label, accept = '.pdf,.doc,.docx', maxSizeMB = 10, file, onChange, error }: Props) {
  const [dragging, setDragging] = useState(false);

  const validate = (f: File): string | null => {
    if (f.size > maxSizeMB * 1024 * 1024) return `File must be under ${maxSizeMB}MB`;
    const exts = accept.split(',').map(e => e.trim());
    const ok = exts.some(ext => f.name.toLowerCase().endsWith(ext.replace('*', '')));
    if (!ok) return `Allowed types: ${accept}`;
    return null;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && !validate(f)) onChange(f);
  }, [onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && !validate(f)) onChange(f);
    e.target.value = '';
  };

  const fmt = (bytes: number) => bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

  if (file) {
    return (
      <div className="border border-success/30 bg-success/5 rounded-btn p-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-success/10 rounded-md flex items-center justify-center flex-shrink-0">
          <CheckCircle size={18} className="text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
          <p className="text-xs text-gray-500">{fmt(file.size)}</p>
        </div>
        <button onClick={() => onChange(null)} className="text-gray-400 hover:text-danger transition-colors">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <label
      className={clsx(
        'drop-zone relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-btn p-8 cursor-pointer transition-all',
        dragging ? 'border-accent bg-accent/5 scale-[1.01]' : 'border-gray-200 hover:border-accent/50 hover:bg-gray-50',
        error ? 'border-danger/50' : ''
      )}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input type="file" accept={accept} onChange={handleChange} className="sr-only" />
      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
        {dragging ? <FileText size={20} className="text-accent" /> : <Upload size={20} className="text-accent" />}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">Drag & drop or <span className="text-accent font-medium">browse files</span></p>
        <p className="text-xs text-gray-400">{accept} · Max {maxSizeMB}MB</p>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </label>
  );
}
