import { Outlet, Link } from 'react-router-dom'; 
import { Zap } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-brand-navy">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-white text-lg">
            <span className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center text-sm"><Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </span>
            <span>Shram<span className='text-orange-400'>Setu</span> </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm text-slate-300">
            <a href="/" className="px-3 py-2 underline hover:text-white text-sm">← Back to home</a>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex items-start justify-center py-10 px-4 bg-white">
        <Outlet />
      </main>
    </div>
  );
}