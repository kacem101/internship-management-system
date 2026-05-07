import { useState } from 'react';
import { Search, Filter, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { OfferCard } from '../../components/OfferCard';
import { useOffers, useSearchOffers } from '../../hooks/useApi';
import { useMyApplications } from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';

const STATUS_FILTERS = ['ALL', 'OPEN', 'CLOSED'];
const DURATION_FILTERS = ['Any', '≤4 weeks', '5–8 weeks', '9+ weeks'];
const PAGE_SIZE = 6;

export function BrowseOffers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [durationFilter, setDurationFilter] = useState('Any');
  const [page, setPage] = useState(0);

  const { data: appsPage } = useMyApplications();
  const appliedOfferIds = new Set((appsPage?.content ?? []).map(a => a.offerId));

  const isSearching = search.trim().length > 0;

  const { data: offersPage, isLoading } = useOffers(
    isSearching ? undefined : { status: statusFilter === 'ALL' ? undefined : statusFilter, page, size: PAGE_SIZE }
  );
  const { data: searchPage, isLoading: isSearchLoading } = useSearchOffers(
    search.trim(),
    { status: statusFilter === 'ALL' ? undefined : statusFilter, page, size: PAGE_SIZE }
  );

  const activePage = isSearching ? searchPage : offersPage;
  const loading = isSearching ? isSearchLoading : isLoading;

  const allOffers = activePage?.content ?? [];
  const filtered = allOffers.filter(o => {
    return durationFilter === 'Any' ||
      (durationFilter === '≤4 weeks' && o.durationWeeks <= 4) ||
      (durationFilter === '5–8 weeks' && o.durationWeeks >= 5 && o.durationWeeks <= 8) ||
      (durationFilter === '9+ weeks' && o.durationWeeks >= 9);
  });

  const totalPages = activePage?.totalPages ?? 0;
  const totalElements = activePage?.totalElements ?? 0;

  const clearFilters = () => { setSearch(''); setStatusFilter('OPEN'); setDurationFilter('Any'); setPage(0); };
  const hasFilters = search || statusFilter !== 'OPEN' || durationFilter !== 'Any';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Browse Internship Offers</h1>
        <p className="page-subtitle">{totalElements} offer{totalElements !== 1 ? 's' : ''} available</p>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by title, company, skills…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }} className="input pl-9" />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost text-sm gap-1.5 text-danger hover:bg-danger/8">
              <X size={14} /> Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 flex items-center gap-1 font-medium"><Filter size={12} /> Filters:</span>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button key={f} onClick={() => { setStatusFilter(f); setPage(0); }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${statusFilter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/30'}`}>
                {f === 'ALL' ? 'All Status' : f}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-gray-200 hidden sm:block" />
          <div className="flex gap-1.5 flex-wrap">
            {DURATION_FILTERS.map(f => (
              <button key={f} onClick={() => { setDurationFilter(f); setPage(0); }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${durationFilter === f ? 'bg-accent text-white border-accent' : 'bg-white text-gray-600 border-gray-200 hover:border-accent/30'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card p-16 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-accent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-primary">No offers found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="btn-outline mt-4 text-sm">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((offer, i) => (
            <OfferCard key={offer.id} offer={offer as any} applied={appliedOfferIds.has(offer.id)} delay={i * 50}
              onView={() => navigate(`/student/offers/${offer.id}`)}
              onApply={() => navigate(`/student/offers/${offer.id}`)} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Page {page + 1} of {totalPages} · {totalElements} total</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${i === page ? 'bg-primary text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
