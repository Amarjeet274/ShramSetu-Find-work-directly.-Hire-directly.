import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/admin/reports').then(({ data }) => setReports(data.reports || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-extrabold">Reports</h1>
      {reports.length === 0 ? <div className="card text-slate-500 text-center py-6">No reports</div> :
        reports.map(r => (
          <div key={r._id} className="card">
            <div className="flex justify-between">
              <p className="font-bold">{r.reason}</p>
              <StatusBadge status={r.status.toLowerCase()} label={r.status} />
            </div>
            <p className="text-slate-600 text-sm mt-1">{r.details}</p>
            <p className="text-xs text-slate-400 mt-2">From: {r.reporter?.phone} ({r.reporter?.role})</p>
          </div>
        ))
      }
    </div>
  );
}