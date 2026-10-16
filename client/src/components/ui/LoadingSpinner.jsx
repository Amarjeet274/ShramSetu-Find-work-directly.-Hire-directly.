export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
      <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      <p className="mt-3 text-slate-600">{label}</p>
    </div>
  );
}