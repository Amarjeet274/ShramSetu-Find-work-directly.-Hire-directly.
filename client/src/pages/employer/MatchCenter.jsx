import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Filter, ChevronRight, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function MatchCenter() {
  const { t } = useTranslation();
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState(jobId || null);
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(!jobId);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  /* ── Step 1: If no jobId, fetch employer's active jobs ── */
  useEffect(() => {
    if (jobId) {
      setActiveJobId(jobId);
      return;
    }
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

  /* ── Step 2: Load job details + real applicants for the active job ── */
  useEffect(() => {
    if (!activeJobId) return;
    setLoadingCandidates(true);

    Promise.all([
      api.get(`/jobs/${activeJobId}`).then(({ data }) => setJob(data.job)),
      api.get(`/jobs/${activeJobId}/applications`).then(({ data }) => {
        const mapped = (data.applications || []).map((a) => ({
          id: a._id,
          workerId: a.worker?._id,
          initials: (a.worker?.fullName || '?')
            .split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase(),
          name: a.worker?.fullName || 'Worker',
          role: `${a.worker?.experienceYears || 0} years experience`,
          rating: a.worker?.rating || 0,
          jobs: a.worker?.totalJobsCompleted || 0,
          score: a.matchScore || 0,
          status: a.status,
          tags: a.worker?.skills || [],
          verified: a.worker?.verification?.idVerified,
          distance: a.distanceKm,
        }));
        setCandidates(mapped);
      }),
    ]).catch(() => {}).finally(() => setLoadingCandidates(false));
  }, [activeJobId]);

  const invite = async (appId) => {
    try {
      await api.patch(`/applications/${appId}`, { status: 'SHORTLISTED' });
      setCandidates((prev) =>
        prev.map((c) => (c.id === appId ? { ...c, status: 'SHORTLISTED' } : c))
      );
    } catch (e) {
      alert(e.response?.data?.message || 'Failed');
    }
  };

  /* ── Loading states ── */
  if (loadingJobs) return <LoadingSpinner />;

  if (!activeJobId && jobs.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-bold text-slate-900">No active jobs to match against</p>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          Post a job first — we'll rank candidates by how well they match.
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

  const strongCount = candidates.filter((c) => c.score >= 85).length;
  const satisfyCount = candidates.filter((c) => c.score >= 70).length;

  return (
    <div>
      {/* Job picker (only when accessed from sidebar without a specific job) */}
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
          <span className="text-xs text-slate-500 shrink-0">
            {jobs.length} active {jobs.length === 1 ? 'job' : 'jobs'}
          </span>
        </div>
      )}

      {/* Header card */}
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-brand-orange">
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-extrabold text-slate-900">ShramSetu Match Center</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Constraint-based matching for {job?.title || 'this job'}
              {job?.employer?.businessName ? ` · ${job.employer.businessName}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <StatBox
            value={candidates.length}
            label="Candidates checked"
            tint="bg-slate-50 text-slate-700"
          />
          <StatBox
            value={satisfyCount}
            label="Satisfy required criteria"
            tint="bg-green-50 text-green-700"
          />
          <StatBox
            value={strongCount}
            label="Strong matches (85%+)"
            tint="bg-orange-50 text-brand-orange"
          />
        </div>

        <p className="mt-5 text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-700">How it works:</strong> The matching engine
          first eliminates candidates who do not meet mandatory requirements. Remaining
          candidates are ranked by how well they satisfy preferred criteria.
        </p>
      </div>

      {/* Candidates */}
      <div className="mt-6 flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-lg">Top Matches</h3>
        <span className="text-xs text-slate-500">Ranked by constraint satisfaction</span>
      </div>

      {loadingCandidates ? (
        <LoadingSpinner />
      ) : candidates.length === 0 ? (
        <div className="card text-center py-10 mt-3">
          <p className="text-4xl mb-2">👥</p>
          <p className="font-bold text-slate-900">No applicants yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Workers who apply will appear here with their match score.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {candidates.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900">{c.name}</p>
                    {c.verified && (
                      <span className="chip bg-green-50 text-green-700 border border-green-200 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {c.status === 'SHORTLISTED' && (
                      <span className="chip bg-blue-50 text-blue-700 border border-blue-200 text-[10px]">
                        Shortlisted
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{c.role}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                    {c.distance != null && <span>📍 {c.distance.toFixed(1)} km</span>}
                    <span className="text-amber-600">★ {c.rating.toFixed(1)}</span>
                    <span>{c.jobs} jobs done</span>
                  </p>
                  {c.tags.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {c.tags.slice(0, 4).map((t) => (
                        <span key={t} className="chip bg-slate-100 text-slate-600 text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center text-sm font-bold shrink-0 ${
                    c.score >= 85
                      ? 'border-green-500 text-green-600'
                      : 'border-amber-500 text-amber-600'
                  }`}
                >
                  <div>{c.score}%</div>
                  <div className="text-[9px] font-medium">Match</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => invite(c.id)}
                  disabled={c.status === 'SHORTLISTED' || c.status === 'HIRED'}
                  className="flex-1 bg-brand-orange hover:bg-brand-orangeDark text-white font-bold rounded-xl py-3 disabled:opacity-50"
                >
                  {c.status === 'SHORTLISTED'
                    ? '✓ Shortlisted'
                    : c.status === 'HIRED'
                    ? '✓ Hired'
                    : 'Invite to Apply'}
                </button>
                <button
                  onClick={() => navigate(`/employer/jobs/${activeJobId}/applicants`)}
                  className="border border-slate-300 rounded-xl px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ value, label, tint }) {
  return (
    <div className={`rounded-xl ${tint} p-4 text-center`}>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-xs mt-1 font-medium">{label}</p>
    </div>
  );
}