import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get('/admin/jobs')
      .then(({ data }) => setJobs(data.jobs || []))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    const reason = prompt('Reason for cancelling?');
    if (!reason) return;
    await api.post(`/admin/jobs/${id}/cancel`, { reason });
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-extrabold">Jobs</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Title</th>
              <th>Employer</th>
              <th>Status</th>
              <th>Pay</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j._id} className="border-b">
                <td className="py-2 font-bold">{j.title}</td>
                <td>{j.employer?.businessName}</td>
                <td>
                  <StatusBadge status={j.status.toLowerCase()} label={j.status} />
                </td>
                <td>
                  ₹{j.payRate}/{j.payType}
                </td>
                <td className="text-right">
                  <button
                    className="text-red-600 font-bold"
                    onClick={() => cancel(j._id)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}