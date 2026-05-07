import { clsx } from 'clsx';

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  OPEN:         { label: 'Open',         cls: 'bg-success/10 text-success border border-success/20',   dot: 'bg-success' },
  CLOSED:       { label: 'Closed',       cls: 'bg-gray-100 text-gray-500 border border-gray-200',       dot: 'bg-gray-400' },
  ARCHIVED:     { label: 'Archived',     cls: 'bg-yellow-50 text-yellow-700 border border-yellow-200',  dot: 'bg-yellow-500' },
  PENDING:      { label: 'Pending',      cls: 'bg-warning/10 text-warning border border-warning/20',    dot: 'bg-warning' },
  UNDER_REVIEW: { label: 'Under Review', cls: 'bg-accent/10 text-accent border border-accent/20',       dot: 'bg-accent' },
  ACCEPTED:     { label: 'Accepted',     cls: 'bg-success/10 text-success border border-success/20',    dot: 'bg-success' },
  REJECTED:     { label: 'Rejected',     cls: 'bg-danger/10 text-danger border border-danger/20',       dot: 'bg-danger' },
  WITHDRAWN:    { label: 'Withdrawn',    cls: 'bg-gray-100 text-gray-500 border border-gray-200',       dot: 'bg-gray-400' },
  STUDENT:      { label: 'Student',      cls: 'bg-accent/10 text-accent border border-accent/20',       dot: 'bg-accent' },
  SUPERVISOR:   { label: 'Supervisor',   cls: 'bg-purple-50 text-purple-700 border border-purple-200',  dot: 'bg-purple-500' },
  ADMIN:        { label: 'Admin',        cls: 'bg-danger/10 text-danger border border-danger/20',       dot: 'bg-danger' },
};

interface Props { status: string; className?: string; showDot?: boolean; }

export function StatusBadge({ status, className, showDot = true }: Props) {
  const config = STATUS_MAP[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600 border border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold', config.cls, className)}>
      {showDot && <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dot)} />}
      {config.label}
    </span>
  );
}
