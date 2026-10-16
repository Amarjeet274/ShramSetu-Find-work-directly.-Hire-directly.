const STYLES = {
  verified: 'bg-green-50 text-green-700 border-green-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  posted: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paused: 'bg-slate-100 text-slate-700 border-slate-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  hired: 'bg-green-50 text-green-700 border-green-200',
  applied: 'bg-amber-50 text-amber-700 border-amber-200',
  shortlisted: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function StatusBadge({ status = 'active', label }) {
  const s = String(status).toLowerCase();
  return (
    <span className={`chip border ${STYLES[s] || STYLES.paused}`}>
      {label || status}
    </span>
  );
}