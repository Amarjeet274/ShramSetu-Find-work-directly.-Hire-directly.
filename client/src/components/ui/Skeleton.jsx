export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
      <div className="h-4 bg-slate-200 rounded w-1/3" />
    </div>
  );
}
export function SkeletonList({ count = 3 }) {
  return <div className="space-y-3">{Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}</div>;
}