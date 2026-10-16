import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import api from '../../services/api';
import JobMatchCard from '../../components/JobMatchCard';

export default function WorkerHome() {
  const { profile } = useOutletContext() || {};
  const [matches, setMatches] = useState([]);
  const [tab, setTab] = useState('matches');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/matched')
      .then(({ data }) => setMatches(data.matches || []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = category ? matches.filter((m) => m.job.category === category) : matches;

  const stats = [
    { icon: 'M8 4h8l2 2v14H6V4h2z', label: 'Jobs Applied', value: 0, tint: 'bg-blue-50 text-blue-600' },
    { icon: 'M5 13l4 4L19 7', label: 'Jobs Completed', value: profile?.totalJobsCompleted ?? 7, tint: 'bg-green-50 text-green-600' },
    { icon: 'M12 2v20M6 12h12', label: 'Week Earnings', value: `₹${profile?.totalEarnings ?? 3500}`, tint: 'bg-orange-50 text-brand-orange' },
    { icon: 'M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z', label: 'Rating', value: `${(profile?.rating || 4.8).toFixed(1)} ★`, tint: 'bg-amber-50 text-amber-600' },
  ];

  const categories = ['All', 'Delivery', 'Driver', 'Construction', 'Domestic Help', 'Warehouse', 'Plumber / Electrician'];

  return (
    <div>
      {/* Greeting banner */}
      <div className="rounded-2xl bg-brand-navy text-white p-5 md:p-6 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-slate-400">Good morning, {profile?.fullName?.split(' ')[0] || 'Rajan'}</p>
          <h2 className="text-lg md:text-xl font-extrabold mt-1">
            {matches.length || 8} new jobs match your profile today
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Last updated: just now · Bengaluru
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand-orange/15 border border-brand-orange/30 flex items-center justify-center">
          <span className="text-brand-orange text-xl">⚡</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl ${s.tint} flex items-center justify-center`}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={s.icon} />
              </svg>
            </div>
            <p className="text-2xl font-extrabold mt-3 text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-slate-200 flex items-center gap-6">
        {[
          { k: 'matches', l: 'Job Matches' },
          { k: 'applications', l: 'Applications' },
          { k: 'saved', l: 'Saved' },
        ].map((tb) => (
          <button
            key={tb.k}
            onClick={() => setTab(tb.k)}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === tb.k
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tb.l}
          </button>
        ))}
        <div className="ml-auto pb-3 text-xs text-slate-500 flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
          Filter
        </div>
      </div>

      {/* Category chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c === 'All' ? '' : c)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              (c === 'All' && !category) || category === c
                ? 'bg-brand-navy text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Job cards */}
      <div className="mt-4 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-slate-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="card py-12 text-center text-slate-500">
            <p className="text-4xl mb-2">📭</p>
            <p className="font-bold">No jobs found</p>
            <p className="text-sm mt-1">Try a different category</p>
          </div>
        )}

        {!loading && filtered.map((m) => (
          <JobMatchCard key={m.job._id} {...m} />
        ))}
      </div>
    </div>
  );
}