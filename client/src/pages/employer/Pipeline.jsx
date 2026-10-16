import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const COLUMNS = [
  { key: 'APPLIED',     label: 'Applied' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW',   label: 'Interview' },
  { key: 'OFFER',       label: 'Offer' },
  { key: 'HIRED',       label: 'Hired' },
];

const NEXT_STAGE = {
  APPLIED: 'SHORTLISTED',
  SHORTLISTED: 'INTERVIEW',
  INTERVIEW: 'OFFER',
  OFFER: 'HIRED',
};

export default function Pipeline() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState(jobId || null);
  const [job, setJob] = useState(null);
  const [cards, setCards] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(!jobId);
  const [loadingCards, setLoadingCards] = useState(false);

  /* Fetch jobs if no jobId in URL */
  useEffect(() => {
    if (jobId) { setActiveJobId(jobId); return; }
    api.get('/jobs', { params: { limit: 50 } })
      .then(({ data }) => {
        const active = (data.jobs || []).filter((j) =>
          ['POSTED', 'APPLIED', 'SHORTLISTED', 'HIRED', 'IN_PROGRESS'].includes(j.status)
        );
        setJobs(active);
        if (active[0]) setActiveJobId(active[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoadingJobs(false));
  }, [jobId]);

  /* Fetch job + applications for the active job */
  const loadApplications = async (id) => {
    if (!id) return;
    setLoadingCards(true);
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/jobs/${id}/applications`),
      ]);
      setJob(jobRes.data.job);

      const mapped = (appsRes.data.applications || []).map((a) => ({
        id: a._id,
        col: a.status,
        initials: (a.worker?.fullName || '?')
          .split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase(),
        name: a.worker?.fullName || 'Worker',
        meta: `${a.worker?.experienceYears || 0} years exp`,
        rating: a.worker?.rating || 0,
        jobs: a.worker?.totalJobsCompleted || 0,
        score: a.matchScore || 0,
      }));
      setCards(mapped);
    } catch {
      setCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  useEffect(() => {
    loadApplications(activeJobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJobId]);

  /* Move candidate to the next stage — persists to backend */
  const move = async (id, fromCol) => {
    const nextStatus = NEXT_STAGE[fromCol];
    if (!nextStatus) return;

    /* Optimistic update */
    const prev = [...cards];
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, col: nextStatus } : c)));

    try {
      if (nextStatus === 'HIRED') {
        await api.post(`/applications/${id}/hire`);
      } else {
        await api.patch(`/applications/${id}`, { status: nextStatus });
      }
    } catch (err) {
      setCards(prev); // rollback
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loadingJobs) return <LoadingSpinner />;

  if (!activeJobId && jobs.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-bold text-slate-900">No active jobs</p>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          Post a job to start tracking applicants.
        </p>
        <button
          onClick={() => navigate('/employer/post-job')}
          className="btn-primary inline-flex"
        >
          + Post a Job
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Job picker */}
      {!jobId && jobs.length > 1 && (
        <div className="card p-3 mb-4 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Job:
          </span>
          <select
            value={activeJobId}
            onChange={(e) => setActiveJobId(e.target.value)}
            className="input !min-h-[40px] py-1.5 flex-1 max-w-sm"
          >
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </select>
        </div>
      )}

      <h1 className="text-2xl font-extrabold text-slate-900">Applicant Pipeline</h1>
      <p className="text-sm text-slate-500 mt-1">
        {job?.title || 'Job'}
        {job?.employer?.businessName ? ` · ${job.employer.businessName}` : ''} ·
        Drag candidates through stages to manage your hiring.
      </p>

      <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800 flex items-start gap-3">
        <Shield className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
        <p>
          <strong>Direct hiring.</strong> You review, shortlist, interview, and make
          offers directly. ShramSetu records the agreement and protects both sides.
        </p>
      </div>

      {loadingCards ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto">
          {COLUMNS.map((col) => {
            const items = cards.filter((c) => c.col === col.key);
            return (
              <div key={col.key} className="min-w-[240px]">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    {col.label}
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {items.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">
                      No candidates here
                    </div>
                  ) : (
                    items.map((c) => (
                      <div key={c.id} className="card p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                            {c.initials}
                          </div>
                          <div
                            className={`w-11 h-11 rounded-full text-[10px] font-bold border-2 flex items-center justify-center ${
                              c.score >= 85
                                ? 'border-green-500 text-green-600'
                                : 'border-amber-500 text-amber-600'
                            }`}
                          >
                            {c.score}%
                          </div>
                        </div>
                        <p className="font-bold text-sm text-slate-900 mt-2">{c.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{c.meta}</p>
                        <p className="text-[11px] text-amber-600 mt-1">
                          ★ {c.rating.toFixed(1)} · {c.jobs} jobs done
                        </p>
                        {NEXT_STAGE[c.col] && (
                          <button
                            onClick={() => move(c.id, c.col)}
                            className="mt-2 w-full bg-orange-50 text-brand-orange text-[11px] font-bold rounded-lg py-1.5 hover:bg-orange-100 transition"
                          >
                            → Move to {COLUMNS.find((x) => x.key === NEXT_STAGE[c.col])?.label}
                          </button>
                        )}
                        {c.col === 'HIRED' && (
                          <div className="mt-2 text-center text-[10px] font-bold text-green-600 py-1.5 bg-green-50 rounded-lg">
                            ✓ Hired
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}