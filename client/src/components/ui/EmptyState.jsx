export default function EmptyState({ title, description, action }) {
  return (
    <div className="card text-center py-12">
      <p className="text-4xl mb-3" aria-hidden="true">📭</p>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      {description && <p className="text-slate-600 mb-5">{description}</p>}
      {action}
    </div>
  );
}