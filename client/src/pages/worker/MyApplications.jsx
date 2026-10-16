import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function MyApplications() {
  const { t } = useTranslation();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications').then(({ data }) => setApps(data.applications || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (apps.length === 0) return <EmptyState title={t('worker.myApplications')} description="Apply to jobs from the Find Work tab." />;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-extrabold">{t('worker.myApplications')}</h1>
      {apps.map((a) => (
        <div key={a._id} className="card">
          <div className="flex justify-between gap-2">
            <div>
              <h3 className="font-bold">{a.job?.title}</h3>
              <p className="text-slate-600 text-sm">{a.job?.employer?.businessName}</p>
            </div>
            <StatusBadge status={a.status.toLowerCase()} label={a.status} />
          </div>
          <div className="mt-3 text-sm text-slate-600 flex flex-wrap gap-3">
            <span>💵 ₹{a.job?.payRate}/{a.job?.payType}</span>
            <span>🎯 Match {a.matchScore}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}