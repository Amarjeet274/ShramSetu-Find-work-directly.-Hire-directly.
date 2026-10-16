import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/admin/audit-logs').then(({ data }) => setLogs(data.logs || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-extrabold">Audit Logs</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">When</th><th>Actor</th><th>Action</th><th>Target</th></tr></thead>
          <tbody>
            {logs.map(l => (
              <tr key={l._id} className="border-b">
                <td className="py-2">{new Date(l.createdAt).toLocaleString()}</td>
                <td>{l.actor?.phone || 'system'}</td>
                <td>{l.action}</td>
                <td>{l.targetType}: {l.targetId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}