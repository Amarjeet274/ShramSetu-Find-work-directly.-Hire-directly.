import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Earnings() {
  const { t } = useTranslation();
  const [e, setE] = useState(null);
  useEffect(() => {
    api.get('/workers/me/earnings').then(({ data }) => setE(data.earnings)).catch(() => setE({})).finally(() => {});
  }, []);
  if (!e) return <LoadingSpinner />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{t('worker.earnings')}</h1>
      <div className="grid grid-cols-2 gap-3">
        {['today', 'thisWeek', 'thisMonth', 'allTime'].map((k) => (
          <div key={k} className="card">
            <p className="text-sm text-slate-500">{t(`worker.${k}`)}</p>
            <p className="text-2xl font-extrabold mt-1">₹{e[k] || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}