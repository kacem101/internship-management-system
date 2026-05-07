import { Building2, MapPin, Clock, Users, ChevronRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { clsx } from 'clsx';
import type { Offer } from '../lib/mockData';

interface Props {
  offer: Offer;
  onApply?: () => void;
  onView?: () => void;
  applied?: boolean;
  delay?: number;
}

export function OfferCard({ offer, onApply, onView, applied, delay = 0 }: Props) {
  const skills = offer.requiredSkills.split(',').map(s => s.trim());
  const visible = skills.slice(0, 4);
  const extra = skills.length - visible.length;

  return (
    <div
      className="card p-5 flex flex-col gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer animate-slide-in-u"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 truncate">{offer.companyName}</p>
            </div>
          </div>
          <h3 className="font-semibold text-primary text-sm leading-snug mt-2">{offer.title}</h3>
        </div>
        <StatusBadge status={offer.status} />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
        <span className="flex items-center gap-1"><MapPin size={12} />{offer.companyLocation}</span>
        <span className="flex items-center gap-1"><Clock size={12} />{offer.durationWeeks} weeks</span>
        <span className="flex items-center gap-1"><Users size={12} />{offer.applicationCount} applicants</span>
      </div>

      {/* Description preview */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{offer.description.replace(/\*\*/g, '').split('\n')[0]}</p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {visible.map(skill => (
          <span key={skill} className="px-2 py-0.5 bg-primary/8 text-primary text-xs rounded-md font-medium border border-primary/10">{skill}</span>
        ))}
        {extra > 0 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md">+{extra} more</span>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
        <span className="text-xs text-gray-400">{new Date(offer.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        {offer.status === 'OPEN' ? (
          applied ? (
            <span className="text-xs font-semibold text-success flex items-center gap-1">✓ Applied</span>
          ) : (
            <button
              className="btn-accent text-xs px-3 py-1.5 flex items-center gap-1"
              onClick={(e) => { e.stopPropagation(); onApply?.(); }}
            >
              Apply Now <ChevronRight size={12} />
            </button>
          )
        ) : (
          <span className="text-xs text-gray-400">Closed</span>
        )}
      </div>
    </div>
  );
}
