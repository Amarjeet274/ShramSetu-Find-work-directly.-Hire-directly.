import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function Notifications() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/notifications').then(({ data }) => setList(data.notifications || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <LoadingSpinner />;
  if (list.length === 0) return <EmptyState title="No notifications" />;
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-extrabold mb-3">Notifications</h1>
      {list.map((n) => (
        <div key={n._id} className={`card ${!n.read ? 'border-brand-orange' : ''}`}>
          <p className="font-bold">{n.title}</p>
          <p className="text-slate-600 text-sm">{n.body}</p>
        </div>
      ))}
    </div>
  );
}