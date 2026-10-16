import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function JobMatchCard({ job, matchScore, distanceKm, breakdown }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const apply = async (e) => {
    e.stopPropagation();
    setApplying(true);
    try {
      await api.post(`/jobs/${job._id}/apply`, {});
      setApplied(true);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Already')) {
        setApplied(true);
      }
    } finally { setApplying(false); }
  };

  const save = async (e) => {
    e.stopPropagation();
    try {
      const { data } = await api.post(`/workers/me/saved-jobs/${job._id}`);
      setSaved(data.saved);
    } catch {}
  };

  const catEmoji = {
    Delivery: '🛵', Construction: '🔨', 'Domestic Help': '🏠',
    Driver: '🚗', Warehouse: '📦', Plumber: '🔧', Electrician: '⚡',
    Cook: '🍳', Security: '🛡',
  }[job.category] || '💼';

  const matchColor =
    matchScore >= 85 ? 'border-green-500 text-green-600'
    : matchScore >= 70 ? 'border-amber-500 text-amber-600'
    : 'border-slate-400 text-slate-600';

  const isUrgent = job.status === 'POSTED' && new Date(job.createdAt) > new Date(Date.now() - 4 * 3600 * 1000);

  return (
    <article className="card p-5 hover:shadow-cardHover transition-shadow">
      <div className="flex items-start gap-4">
        {/* Category icon */}
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl shrink-0">
          {catEmoji}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 text-[16px]">{job.title}</h3>
            {isUrgent && (
              <span className="chip bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold tracking-wide">
                URGENT
              </span>
            )}
          </div>

          {/* Employer row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-sm text-slate-500">{job.employer?.businessName}</p>
            {job.employer?.verification?.businessVerified && (
              <span className="chip bg-green-50 text-green-700 border border-green-200 text-[11px]">
                <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                Employer verified
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 mt-2.5 line-clamp-2">{job.description}</p>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            {job.address && (
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s-8-8-8-13a8 8 0 1116 0c0 5-8 13-8 13z"/><circle cx="12" cy="9" r="2.5"/></svg>
                {job.address}
              </span>
            )}
            {distanceKm != null && (
              <span>• {distanceKm.toFixed(1)} km</span>
            )}
            <span className="font-bold text-brand-orange">₹{job.payRate}/{job.payType}</span>
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              2 hours ago
            </span>
            <span className="chip bg-slate-100 text-slate-600">{job.payType === 'day' ? 'Daily' : job.payType}</span>
          </div>
        </div>

        {/* Right side: match ring + save */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className={`match-ring ${matchColor}`} aria-label={`${matchScore}% match`}>
            {matchScore}%
          </div>
          <button onClick={save} aria-label="Save job" className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg">
            <svg viewBox="0 0 24 24" className={`w-5 h-5 ${saved ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} stroke="currentColor" strokeWidth="1.8" fill={saved ? 'currentColor' : 'none'}>
              <path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Why this matches pill */}
      <button className="mt-4 w-full text-left bg-orange-50/60 border border-orange-100 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-700 hover:bg-orange-50">
        <span className="flex items-center gap-2">
          <span className="text-brand-orange">⚡</span>
          Why does this job match you? ({matchScore}% ShramSetu Match)
        </span>
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
      </button>

      {/* Apply row */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={apply}
          disabled={applying || applied}
          className={`flex-1 min-h-[52px] rounded-xl font-bold text-white transition ${
            applied
              ? 'bg-green-600 cursor-default'
              : 'bg-brand-orange hover:bg-brand-orangeDark'
          }`}
        >
          {applied ? '✓ Applied' : applying ? 'Applying…' : 'Apply Directly'}
        </button>
        <button
          onClick={() => navigate(`/worker/jobs/${job._id}`)}
          aria-label="View"
          className="w-12 h-12 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.9">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button
          aria-label="Chat"
          className="w-12 h-12 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.9">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </button>
      </div>
    </article>
  );
}