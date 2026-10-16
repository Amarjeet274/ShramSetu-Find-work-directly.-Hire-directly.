import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminDashboard() {
  const [a, setA] = useState(null);
  useEffect(() => { api.get('/admin/analytics').then(({ data }) => setA(data.analytics)).catch(() => {}); }, []);
  if (!a) return <LoadingSpinner />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ['Total Users', a.totalUsers],
          ['Workers', a.workers],
          ['Employers', a.employers],
          ['Active Jobs', a.activeJobs],
          ['Completed Jobs', a.completedJobs],
          ['Transactions', a.transactions?.count || 0],
          ['Open Reports', a.openReports],
          ['Pending Verifications', a.pendingVerifications],
        ].map(([label, v]) => (
          <div key={label} className="card">
            <p className="text-slate-500 text-sm">{label}</p>
            <p className="text-3xl font-extrabold mt-1">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}