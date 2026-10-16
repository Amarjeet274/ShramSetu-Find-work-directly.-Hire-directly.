import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Zap } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function PublicLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const scrollToSection = (id) => (e) => {
    e.preventDefault();
    closeMenu();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const NAV = [
    { id: 'how', label: 'How it Works' },
    { id: 'workers', label: 'For Workers' },
    { id: 'employers', label: 'For Employers' },
    { id: 'categories', label: 'Categories' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-brand-navy sticky top-0 z-40 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2 font-extrabold text-white text-lg shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center text-sm">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </span>
            <span>Shram<span className='text-orange-400'>Setu</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm text-slate-300">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={scrollToSection(n.id)}
              className="px-3 py-2 hover:text-white transition cursor-pointer"
            >
              {n.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher dark />
          <button
            onClick={() => navigate('/auth')}
            className="text-white text-sm font-medium px-3 py-2 hover:bg-white/5 rounded-lg transition"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/auth?role=worker')}
            className="bg-brand-orange hover:bg-brand-orangeDark text-white font-semibold text-sm rounded-xl px-4 py-2.5 min-h-[40px] inline-flex items-center gap-2 transition-colors"
          >
            Find Work
          </button>
          <button
            onClick={() => navigate('/auth?role=employer')}
            className="inline-flex bg-transparent border border-white/30 hover:border-white text-white font-semibold text-sm rounded-xl px-4 py-2.5 min-h-[40px] items-center gap-2 transition-colors"
          >
            Hire Workers
          </button>
        </div>

        {/* Mobile actions + hamburger */}
        <div className="flex md:hidden items-center gap-1.5">
          <LanguageSwitcher dark />
          <button
            onClick={() => navigate('/auth?role=worker')}
            className="bg-brand-orange text-white font-semibold text-xs rounded-lg px-3 py-2"
          >
            Find Work
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center text-white"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
    </div>
      </header >

    {/* Mobile drawer */ }
  {
    menuOpen && (
      <>
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={closeMenu} />
        <div className="fixed top-[57px] left-0 right-0 bg-brand-navy border-b border-white/10 z-40 md:hidden shadow-xl">
          <nav className="px-4 py-3 flex flex-col">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={scrollToSection(n.id)}
                className="px-3 py-3 text-sm text-slate-200 hover:bg-white/5 rounded-lg"
              >
                {n.label}
              </a>
            ))}

            <div className="h-px bg-white/10 my-2" />

            <button
              onClick={() => { closeMenu(); navigate('/auth'); }}
              className="text-left px-3 py-3 text-sm text-slate-200 hover:bg-white/5 rounded-lg"
            >
              Sign In
            </button>

            <button
              onClick={() => { closeMenu(); navigate('/auth?role=employer'); }}
              className="mt-2 mb-1 bg-transparent border border-white/30 hover:border-white text-white font-semibold text-sm rounded-xl px-4 py-3 text-center transition"
            >
              Hire Workers
            </button>
          </nav>
        </div>
      </>
    )
  }

  <Outlet />
    </div >
  );
}