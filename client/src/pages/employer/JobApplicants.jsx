import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function JobApplicants() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get(`/jobs/${id}/applications`).then(({ data }) => setApps(data.applications || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const act = async (appId, action) => {
    try {
      if (action === 'hire') await api.post(`/applications/${appId}/hire`);
      else await api.patch(`/applications/${appId}`, { status: action.toUpperCase() });
      load();
    } catch {}
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <button className="btn-ghost" onClick={() => navigate('/employer')}>← Dashboard</button>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{t('employer.recentApplicants')}</h1>
        <button className="btn-secondary" onClick={() => navigate(`/employer/match/${id}`)}>⚡ Match Center</button>
      </div>

      {apps.length === 0 ? (
        <div className="card text-center text-slate-500 py-10">No applications yet</div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a._id} className="card">
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-bold text-lg">{a.worker?.fullName || 'Worker'}</h3>
                  <p className="text-slate-500 text-sm">{a.worker?.skills?.join(' • ') || 'No skills listed'}</p>
                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-600">
                    <span>⭐ {a.worker?.rating?.toFixed(1) || '0.0'}</span>
                    <span>📋 {a.worker?.totalJobsCompleted || 0} jobs</span>
                    {a.worker?.verification?.idVerified && <StatusBadge status="verified" label="Verified" />}
                  </div>
                </div>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold ${a.matchScore >= 85 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {a.matchScore}%
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="btn-secondary flex-1 !min-h-[48px]" onClick={() => act(a._id, 'reject')}>Reject</button>
                <button className="btn-secondary flex-1 !min-h-[48px]" onClick={() => act(a._id, 'shortlisted')}>Shortlist</button>
                <button className="btn-primary flex-1 !min-h-[48px]" onClick={() => act(a._id, 'hire')}>Hire</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}