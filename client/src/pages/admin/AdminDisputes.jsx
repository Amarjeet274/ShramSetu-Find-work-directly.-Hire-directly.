import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminDisputes() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get('/admin/disputes')
      .then(({ data }) => setList(data.disputes || []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const update = async (id, status) => {
    const resolution =
      status === 'RESOLVED' ? prompt('Resolution note?') : undefined;
    await api.patch(`/admin/disputes/${id}`, { status, resolution });
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-extrabold">Disputes</h1>
      {list.length === 0 && (
        <div className="card text-center text-slate-500 py-6">No disputes</div>
      )}
      {list.map((d) => (
        <div key={d._id} className="card">
          <div className="flex justify-between">
            <p className="font-bold">{d.reason || 'Dispute'}</p>
            <StatusBadge status={d.status.toLowerCase()} label={d.status} />
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Raised by: {d.raisedBy?.phone} ({d.raisedBy?.role})
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => update(d._id, 'INVESTIGATING')}
            >
              Investigate
            </Button>
            <Button className="flex-1" onClick={() => update(d._id, 'RESOLVED')}>
              Resolve
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}