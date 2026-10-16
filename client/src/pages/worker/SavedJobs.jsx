import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/workers/me/saved-jobs')
      .then(({ data }) => setJobs(data.savedJobs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (jobs.length === 0)
    return (
      <EmptyState
        title="No saved jobs yet"
        description="Tap the ♡ on any job to save it here."
      />
    );

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-extrabold">Saved Jobs</h1>
      {jobs.map((j) => (
        <div key={j._id} className="card">
          <h3 className="font-bold">{j.title}</h3>
          <p className="text-slate-500 text-sm">{j.employer?.businessName}</p>
          <p className="text-sm mt-1">
            💵 ₹{j.payRate}/{j.payType}
          </p>
          <button
            className="btn-primary mt-3 w-full"
            onClick={() => navigate(`/worker/jobs/${j._id}`)}
          >
            View
          </button>
        </div>
      ))}
    </div>
  );
}