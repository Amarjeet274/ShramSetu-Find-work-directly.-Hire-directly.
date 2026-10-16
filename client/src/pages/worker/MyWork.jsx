import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function MyWork() {
  const { t } = useTranslation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/assignments').then(({ data }) => setList(data.assignments || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const requestCompletion = async (id) => {
    try { await api.post(`/assignments/${id}/complete`, {}); load(); } catch {}
  };

  if (loading) return <LoadingSpinner />;
  if (list.length === 0) return <EmptyState title={t('nav.myWork')} description="No active assignments yet." />;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-extrabold">{t('nav.myWork')}</h1>
      {list.map((a) => (
        <div key={a._id} className="card">
          <div className="flex justify-between">
            <h3 className="font-bold">{a.job?.title}</h3>
            <StatusBadge status={a.status.toLowerCase()} label={a.status} />
          </div>
          <div className="mt-2 text-sm text-slate-600 flex flex-wrap gap-3">
            <span>💵 ₹{a.job?.payRate}</span>
            <span>📍 {a.job?.address || '—'}</span>
          </div>
          {a.status === 'IN_PROGRESS' && (
            <button className="btn-primary mt-3 w-full" onClick={() => requestCompletion(a._id)}>
              ✅ Mark as completed
            </button>
          )}
        </div>
      ))}
    </div>
  );
}