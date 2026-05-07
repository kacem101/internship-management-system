import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, MapPin, Clock, Calendar, Users, ChevronLeft, CheckCircle2, Send, AlertCircle, Loader2 } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { FileUploadZone } from '../../components/FileUploadZone';
import { useOffer, useApply, useMyApplications } from '../../hooks/useApi';
import { applicationSchema, type ApplicationForm } from '../../lib/schemas';

export function OfferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const offerId = Number(id);

  const { data: offer, isLoading } = useOffer(offerId);
  const { data: appsPage } = useMyApplications();
  const alreadyApplied = (appsPage?.content ?? []).some(a => a.offerId === offerId);
  const applyMutation = useApply();

  const [resume, setResume] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema) as any,
  });
  const coverLetter = watch('coverLetter', '');

  if (isLoading) return <div className="card p-16 flex items-center justify-center"><Loader2 size={28} className="animate-spin text-accent" /></div>;
  if (!offer) return <div className="card p-16 text-center"><p className="text-gray-500">Offer not found.</p><button onClick={() => navigate('/student/offers')} className="btn-outline mt-4 text-sm">Back to offers</button></div>;

  const onSubmit = async (data: ApplicationForm) => {
    setApiError(null);
    try {
      await applyMutation.mutateAsync({ offerId, coverLetter: data.coverLetter, resume });
      setSubmitted(true);
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? 'Failed to submit application.');
    }
  };

  const skills = offer.requiredSkills.split(',').map(s => s.trim());

  if (submitted) return (
    <div className="max-w-lg mx-auto card p-12 text-center animate-scale-in">
      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} className="text-success" /></div>
      <h2 className="font-display text-xl font-700 text-primary mb-2">Application Submitted!</h2>
      <p className="text-gray-500 text-sm mb-6">Your application to <strong>{offer.companyName}</strong> has been sent.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => navigate('/student/applications')} className="btn-primary text-sm">View Applications</button>
        <button onClick={() => navigate('/student/offers')} className="btn-outline text-sm">Browse More</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors">
        <ChevronLeft size={16} /> Back to offers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center"><Building2 size={22} className="text-primary" /></div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">{offer.companyName}</p>
                  <h1 className="font-display text-xl font-700 text-primary">{offer.title}</h1>
                </div>
              </div>
              <StatusBadge status={offer.status} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-accent" />{offer.companyLocation}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-accent" />{offer.durationWeeks} weeks</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-accent" />{new Date(offer.startDate).toLocaleDateString('en-GB')} → {new Date(offer.endDate).toLocaleDateString('en-GB')}</span>
              <span className="flex items-center gap-1.5"><Users size={14} className="text-accent" />{offer.applicationCount} applicants</span>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-primary mb-3">About the Internship</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{offer.description}</p>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-primary mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => <span key={skill} className="px-3 py-1.5 bg-primary/8 text-primary text-sm rounded-lg font-medium border border-primary/12">{skill}</span>)}
            </div>
          </div>

          {offer.status === 'OPEN' && (
            <div className="card p-6">
              <h2 className="font-semibold text-primary mb-1">Apply for this Position</h2>
              <p className="text-sm text-gray-500 mb-5">Complete the form below to submit your application.</p>
              {alreadyApplied ? (
                <div className="flex items-center gap-3 p-4 bg-success/8 rounded-lg border border-success/20">
                  <CheckCircle2 size={18} className="text-success" />
                  <div><p className="text-sm font-semibold text-success">Already Applied</p><p className="text-xs text-gray-500">You've already submitted an application for this offer.</p></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {apiError && (
                    <div className="flex items-start gap-2 p-3 bg-danger/8 rounded-lg border border-danger/20">
                      <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-danger">{apiError}</p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="label">Cover Letter *</label>
                      <span className={`text-xs font-medium ${coverLetter.length < 100 ? 'text-warning' : 'text-success'}`}>{coverLetter.length} / 100 min</span>
                    </div>
                    <textarea {...register('coverLetter')} rows={7} placeholder="Describe your motivation and relevant experience…"
                      className={`input resize-none leading-relaxed ${errors.coverLetter ? 'input-error' : ''}`} />
                    {errors.coverLetter && <p className="text-xs text-danger mt-1 flex items-center gap-1"><AlertCircle size={11} /> {errors.coverLetter.message}</p>}
                  </div>
                  <FileUploadZone label="Upload Resume (optional)" file={resume} onChange={setResume} accept=".pdf,.doc,.docx" maxSizeMB={10} />
                  <button type="submit" disabled={applyMutation.isPending} className="btn-primary w-full justify-center py-3 text-sm font-semibold">
                    {applyMutation.isPending ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : <><Send size={15} /> Submit Application</>}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="card p-5 sticky top-24 h-fit">
          <h3 className="font-semibold text-primary mb-4">Position Summary</h3>
          <div className="space-y-3 text-sm">
            {[
              { l: 'Company', v: offer.companyName },
              { l: 'Location', v: offer.companyLocation },
              { l: 'Duration', v: `${offer.durationWeeks} weeks` },
              { l: 'Start Date', v: new Date(offer.startDate).toLocaleDateString('en-GB', { dateStyle: 'long' }) },
              { l: 'End Date', v: new Date(offer.endDate).toLocaleDateString('en-GB', { dateStyle: 'long' }) },
              { l: 'Applicants', v: `${offer.applicationCount} students` },
            ].map(({ l, v }) => (
              <div key={l} className="flex justify-between border-b border-gray-50 pb-2 last:border-0">
                <span className="text-gray-500">{l}</span>
                <span className="font-medium text-gray-800 text-right max-w-[140px]">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100"><StatusBadge status={offer.status} className="w-full justify-center py-1.5" /></div>
        </div>
      </div>
    </div>
  );
}
