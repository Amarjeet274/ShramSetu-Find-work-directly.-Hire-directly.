import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminPayments() {
  const [data, setData] = useState({ payments: [], totalVolume: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/payments')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-extrabold">Payments</h1>
        <p className="text-slate-500">
          Volume: ₹{(data.totalVolume || 0).toLocaleString()}
        </p>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Worker</th>
              <th>Employer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Provider ID</th>
            </tr>
          </thead>
          <tbody>
            {(data.payments || []).map((p) => (
              <tr key={p._id} className="border-b">
                <td className="py-2">{p.worker?.fullName || '—'}</td>
                <td>{p.employer?.businessName || '—'}</td>
                <td className="font-bold">₹{p.amount}</td>
                <td>
                  <StatusBadge status={p.status.toLowerCase()} label={p.status} />
                </td>
                <td className="text-xs text-slate-500">
                  {p.providerPaymentId || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}