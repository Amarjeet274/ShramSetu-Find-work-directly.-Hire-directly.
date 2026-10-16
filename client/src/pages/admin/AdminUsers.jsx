import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  useEffect(() => {
    api.get('/admin/users', { params: { role } }).then(({ data }) => setUsers(data.users || [])).catch(() => {}).finally(() => setLoading(false));
  }, [role]);
  const setStatus = async (id, status) => {
    if (!confirm(`Set status to ${status}?`)) return;
    await api.patch(`/admin/users/${id}/status`, { status, reason: 'admin action' });
    setUsers(u => u.map(x => x._id === id ? { ...x, status } : x));
  };
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Users</h1>
      <div className="flex gap-2">
        {['', 'worker', 'employer'].map(r => (
          <button key={r} onClick={() => setRole(r)} className={`chip border-2 ${role === r ? 'bg-brand-orange text-white border-brand-orange' : ''}`}>{r || 'All'}</button>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">Phone</th><th>Role</th><th>Status</th><th>Verified</th><th></th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b">
                <td className="py-2">{u.phone}</td>
                <td>{u.role}</td>
                <td><StatusBadge status={u.status} label={u.status} /></td>
                <td>{u.verificationStatus}</td>
                <td className="text-right">
                  <button className="text-red-600 font-bold mr-3" onClick={() => setStatus(u._id, 'suspended')}>Suspend</button>
                  <button className="text-green-600 font-bold" onClick={() => setStatus(u._id, 'active')}>Activate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}