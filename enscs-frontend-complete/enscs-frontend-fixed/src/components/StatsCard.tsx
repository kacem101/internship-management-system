import { clsx } from 'clsx';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string };
  className?: string;
  delay?: number;
}

export function StatsCard({ label, value, icon: Icon, iconColor = 'text-accent', iconBg = 'bg-accent/10', trend, className, delay = 0 }: Props) {
  return (
    <div
      className={clsx('card p-5 flex items-start gap-4 animate-slide-in-u', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={clsx('w-11 h-11 rounded-card flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-primary font-display leading-none">{value}</p>
        {trend && (
          <div className={clsx('flex items-center gap-1 mt-1.5 text-xs font-medium', trend.value >= 0 ? 'text-success' : 'text-danger')}>
            {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(trend.value)}% {trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
