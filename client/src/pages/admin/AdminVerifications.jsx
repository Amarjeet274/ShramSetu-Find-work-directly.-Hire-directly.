import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminVerifications() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => api.get('/admin/verifications').then(({ data }) => setList(data.verifications || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const review = async (id, status) => {
    await api.patch(`/admin/verifications/${id}`, { status, notes: 'Reviewed' });
    load();
  };
  if (loading) return <LoadingSpinner />;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-extrabold">Pending Verifications</h1>
      {list.length === 0 ? <div className="card text-slate-500 text-center py-6">No pending verifications</div> :
        list.map(v => (
          <div key={v._id} className="card">
            <p className="font-bold">{v.user?.phone} ({v.user?.role})</p>
            <p className="text-slate-500 text-sm">Type: {v.type}</p>
            <div className="mt-3 flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => review(v._id, 'REJECTED')}>Reject</button>
              <button className="btn-primary flex-1" onClick={() => review(v._id, 'APPROVED')}>Approve</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}