import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import PayWorker from './PayWorker';

export default function EmployerPayments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/assignments')
      .then(({ data }) => setAssignments(data.assignments || []))
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner />;

  const pending = assignments.filter((a) => a.status === 'COMPLETED');
  const inProgress = assignments.filter((a) => a.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Payments</h1>
        <p className="text-sm text-slate-500 mt-1">
          Pay workers directly. ShramSetu doesn't take commission from worker wages.
        </p>
      </div>

      {/* Pending payments */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Pending Payments ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <EmptyState
            title="No pending payments"
            description="Completed assignments waiting for payment will appear here."
          />
        ) : (
          <div className="space-y-3">
            {pending.map((a) => (
              <div key={a._id} className="card p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-bold text-slate-900">{a.job?.title || 'Assignment'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {a.job?.address || ''}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status="completed" label="Ready to pay" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Amount</p>
                    <p className="text-2xl font-extrabold text-slate-900">
                      ₹{a.job?.payRate || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <PayWorker assignment={a} onPaid={load} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* In-progress */}
      {inProgress.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            In Progress ({inProgress.length})
          </h2>
          <div className="space-y-2">
            {inProgress.map((a) => (
              <div key={a._id} className="card p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{a.job?.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.job?.address}</p>
                </div>
                <StatusBadge status="active" label="In Progress" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}