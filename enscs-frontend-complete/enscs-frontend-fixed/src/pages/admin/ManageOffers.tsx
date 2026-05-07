import { useState } from 'react';
import { Plus, Edit2, Archive, ArchiveRestore, Trash2, Search, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusBadge } from '../../components/StatusBadge';
import { DrawerPanel } from '../../components/DrawerPanel';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useOffers, useCreateOffer, useUpdateOffer, useDeleteOffer, useUpdateOfferStatus } from '../../hooks/useApi';
import { offerSchema, type OfferForm } from '../../lib/schemas';
import type { OfferResponse } from '../../lib/api';

export function ManageOffers() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editOffer, setEditOffer] = useState<OfferResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: offersPage, isLoading } = useOffers({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page, size: 15,
  });

  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer(editOffer?.id ?? 0);
  const deleteOffer = useDeleteOffer();
  const updateStatus = useUpdateOfferStatus();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OfferForm>({ resolver: zodResolver(offerSchema) as any });

  const offers = (offersPage?.content ?? []).filter(o =>
    !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditOffer(null); reset({}); setApiError(null); setDrawerOpen(true); };
  const openEdit = (o: OfferResponse) => {
    setEditOffer(o);
    setApiError(null);
    reset({ title: o.title, description: o.description, companyName: o.companyName, companyLocation: o.companyLocation, startDate: o.startDate, endDate: o.endDate, durationWeeks: o.durationWeeks, requiredSkills: o.requiredSkills, reportDeadlineDays: o.reportDeadlineDays ?? 14 });
    setDrawerOpen(true);
  };

  const onSubmit = async (data: OfferForm) => {
    setApiError(null);
    try {
      if (editOffer) await updateOffer.mutateAsync(data);
      else await createOffer.mutateAsync(data);
      setDrawerOpen(false);
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? 'Failed to save offer. Please try again.');
    }
  };

  const handleDelete = async (id: number) => { await deleteOffer.mutateAsync(id); setDeleteId(null); };
  const handleArchive   = (id: number) => updateStatus.mutate({ id, status: 'ARCHIVED' });
  const handleUnarchive = (id: number) => updateStatus.mutate({ id, status: 'OPEN' });

  const saving = createOffer.isPending || updateOffer.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="page-title">Manage Offers</h1><p className="page-subtitle">{offersPage?.totalElements ?? 0} total offers</p></div>
        <button onClick={openNew} className="btn-primary text-sm flex-shrink-0"><Plus size={16} /> New Offer</button>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search offers…" value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'OPEN', 'CLOSED', 'ARCHIVED'].map(f => (
            <button key={f} onClick={() => { setStatusFilter(f); setPage(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${statusFilter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/30'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex justify-center"><Loader2 size={28} className="animate-spin text-accent" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Title</th>
                  <th className="table-header hidden md:table-cell">Company</th>
                  <th className="table-header hidden lg:table-cell">Duration</th>
                  <th className="table-header hidden sm:table-cell">Applicants</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map(offer => (
                  <tr key={offer.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="table-cell font-medium text-primary text-sm max-w-[200px]">
                      <p className="truncate">{offer.title}</p>
                      <p className="text-xs text-gray-400 md:hidden">{offer.companyName}</p>
                    </td>
                    <td className="table-cell hidden md:table-cell text-xs text-gray-500">{offer.companyName}</td>
                    <td className="table-cell hidden lg:table-cell text-xs text-gray-500">{offer.durationWeeks}w</td>
                    <td className="table-cell hidden sm:table-cell"><span className="text-sm font-semibold text-primary">{offer.applicationCount}</span></td>
                    <td className="table-cell"><StatusBadge status={offer.status} /></td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(offer)} className="p-1.5 rounded-md text-gray-400 hover:text-accent hover:bg-accent/8 transition-colors" title="Edit"><Edit2 size={14} /></button>
                        {offer.status === 'OPEN'     && <button onClick={() => handleArchive(offer.id)}   className="p-1.5 rounded-md text-gray-400 hover:text-warning hover:bg-warning/8 transition-colors" title="Archive"><Archive size={14} /></button>}
                        {offer.status === 'ARCHIVED' && <button onClick={() => handleUnarchive(offer.id)} className="p-1.5 rounded-md text-gray-400 hover:text-success hover:bg-success/8 transition-colors" title="Unarchive (reopen)"><ArchiveRestore size={14} /></button>}
                        <button onClick={() => setDeleteId(offer.id)} className="p-1.5 rounded-md text-gray-400 hover:text-danger hover:bg-danger/8 transition-colors" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {offers.length === 0 && <div className="p-12 text-center text-gray-400 text-sm">No offers found</div>}
          </div>
        )}
      </div>

      <DrawerPanel open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={editOffer ? 'Edit Offer' : 'New Internship Offer'}
        subtitle={editOffer ? `Editing: ${editOffer.title}` : 'Fill in the details to publish a new offer'}
        footer={
          <div className="flex gap-3">
            <button onClick={() => setDrawerOpen(false)} className="btn-outline flex-1 justify-center text-sm">Cancel</button>
            <button onClick={handleSubmit(onSubmit)} disabled={saving} className="btn-primary flex-1 justify-center text-sm">
              {saving ? 'Saving…' : editOffer ? 'Update Offer' : 'Publish Offer'}
            </button>
          </div>
        }>
        <form className="space-y-4">
          {apiError && (
            <div className="flex items-start gap-2 p-3 bg-danger/8 rounded-lg border border-danger/20">
              <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
              <p className="text-xs text-danger">{apiError}</p>
            </div>
          )}
          <div><label className="label">Title *</label><input {...register('title')} className={`input ${errors.title ? 'input-error' : ''}`} />{errors.title && <p className="text-xs text-danger mt-1">{errors.title.message}</p>}</div>
          <div><label className="label">Description *</label><textarea {...register('description')} rows={5} className={`input resize-none ${errors.description ? 'input-error' : ''}`} placeholder="Describe responsibilities…" />{errors.description && <p className="text-xs text-danger mt-1">{errors.description.message}</p>}</div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Company *</label><input {...register('companyName')} className={`input ${errors.companyName ? 'input-error' : ''}`} />{errors.companyName && <p className="text-xs text-danger mt-1">{errors.companyName.message}</p>}</div>
            <div><label className="label">Location</label><input {...register('companyLocation')} className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Start Date *</label><input type="date" {...register('startDate')} className={`input ${errors.startDate ? 'input-error' : ''}`} />{errors.startDate && <p className="text-xs text-danger mt-1">{errors.startDate.message}</p>}</div>
            <div><label className="label">End Date *</label><input type="date" {...register('endDate')} className={`input ${errors.endDate ? 'input-error' : ''}`} />{errors.endDate && <p className="text-xs text-danger mt-1">{errors.endDate.message}</p>}</div>
          </div>
          <div><label className="label">Duration (weeks) *</label><input type="number" {...register('durationWeeks')} className={`input ${errors.durationWeeks ? 'input-error' : ''}`} />{errors.durationWeeks && <p className="text-xs text-danger mt-1">{errors.durationWeeks.message}</p>}</div>
          <div><label className="label">Required Skills</label><input {...register('requiredSkills')} className="input" placeholder="Python, Linux, SIEM (comma-separated)" /></div>
          <div><label className="label">Report Deadline <span className="text-gray-400 font-normal text-xs">(days after internship ends)</span></label><input type="number" {...register('reportDeadlineDays')} defaultValue={14} className={`input ${errors.reportDeadlineDays ? 'input-error' : ''}`} />{errors.reportDeadlineDays && <p className="text-xs text-danger mt-1">{errors.reportDeadlineDays.message}</p>}</div>
        </form>
      </DrawerPanel>

      <ConfirmDialog open={deleteId !== null} title="Delete Offer" description="Are you sure you want to delete this offer?" confirmLabel="Delete" variant="danger"
        onConfirm={() => deleteId !== null && handleDelete(deleteId)} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
