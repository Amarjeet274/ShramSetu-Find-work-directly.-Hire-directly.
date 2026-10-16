import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/jobs?limit=20').then(({ data }) => setJobs(data.jobs || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const active = jobs.filter((j) => ['POSTED', 'APPLIED', 'SHORTLISTED', 'HIRED', 'IN_PROGRESS'].includes(j.status));

  const stats = [
    { icon: 'M4 5h6v6H4zM14 5h6v6h-6zM4 13h6v6H4zM14 13h6v6h-6z', label: 'Active Jobs', value: active.length || 3, sub: '2 accepting applications', tint: 'bg-blue-50 text-blue-600' },
    { icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0', label: 'Total Applicants', value: 24, sub: 'This week', tint: 'bg-orange-50 text-brand-orange' },
    { icon: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z', label: 'Strong Matches', value: 9, sub: 'Satisfy all criteria', tint: 'bg-green-50 text-green-600' },
    { icon: 'M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z', label: 'Interviews Set', value: 4, sub: 'Next 3 days', tint: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${s.tint} flex items-center justify-center`}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
            </div>
            <p className="text-3xl font-extrabold mt-4 text-slate-900">{s.value}</p>
            <p className="text-sm font-semibold text-slate-800 mt-1">{s.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Active jobs */}
      <div className="card mt-6">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-lg">Active Jobs</h2>
          <Link to="/employer/post-job" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            + Post New
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-5 text-center text-slate-400 text-sm">Loading…</div>
          ) : active.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">No active jobs yet.</p>
              <Link to="/employer/post-job" className="btn-primary inline-flex mt-3 text-sm">+ Post your first job</Link>
            </div>
          ) : (
            active.map((j) => (
              <div key={j._id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-lg">🛵</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900">{j.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">8 applicants · 4 strong matches</p>
                </div>
                <span className={`chip ${j.status === 'POSTED' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {j.status === 'POSTED' ? 'Active' : j.status}
                </span>
                <button
                  onClick={() => navigate(`/employer/jobs/${j._id}/applicants`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-4 py-2"
                >
                  View Matches
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Direct connection banner */}
      <div className="rounded-2xl bg-brand-navy text-white p-5 mt-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"/></svg>
        </div>
        <div className="flex-1">
          <p className="font-bold">Direct connection. No labor broker.</p>
          <p className="text-sm text-slate-400 mt-1">
            You discover workers, review their profiles, and make hiring decisions directly. ShramSetu verifies, matches, and protects — but never makes employment decisions for you.
          </p>
        </div>
        <button onClick={() => navigate('/employer/match')} className="btn-primary text-sm shrink-0">
          View Matches →
        </button>
      </div>

      {/* Recent applicants */}
      <div className="card mt-6">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-lg">Recent Applicants</h2>
          <button className="text-sm font-semibold text-blue-600">View pipeline →</button>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { i: 'AM', name: 'Arun Mishra', role: 'Delivery Rider', dist: '1.1 km', exp: '5 years', rating: 4.8, jobs: 94, score: 96 },
            { i: 'DN', name: 'Deepa Nair', role: 'Delivery Rider', dist: '2.3 km', exp: '2 years', rating: 4.6, jobs: 43, score: 89 },
            { i: 'SP', name: 'Sanjay Patil', role: 'Delivery Rider', dist: '3.8 km', exp: '3 years', rating: 4.5, jobs: 61, score: 84 },
          ].map((a) => (
            <div key={a.name} className="px-5 py-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {a.i}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">{a.name}</p>
                  <span className="chip bg-green-50 text-green-700 border border-green-200 text-[10px]">
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {a.role} · {a.dist} · {a.exp} exp
                </p>
                <p className="text-xs text-amber-600 mt-0.5">★ {a.rating} · {a.jobs} jobs done</p>
              </div>
              <div className={`match-ring ${a.score >= 85 ? 'border-green-500 text-green-600' : 'border-amber-500 text-amber-600'}`}>
                {a.score}%
                <span className="sr-only"> match</span>
              </div>
              <button className="border border-slate-300 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}