import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import {
  computeEmployerStrength,
  getEmployerTier,
  getNextEmployerAction,
} from '../utils/employerProfileStrength';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserMenu from '../components/layout/UserMenu';
import NotificationBell from '../components/layout/NotificationBell';
import api from '../services/api';

export default function EmployerLayout() {
  const { t } = useTranslation();
  const { logoutLocal } = useAuthStore();
  const navigate = useNavigate();

  const { employerProfile: profile, fetchEmployerProfile } = useProfileStore();

  useEffect(() => { fetchEmployerProfile(); }, [fetchEmployerProfile]);

  const strength = computeEmployerStrength(profile);
  const tier = getEmployerTier(strength);
  const nextAction = getNextEmployerAction(profile);

  const initials = (profile?.businessName || '?')
    .split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  const nav = [
    { to: '/employer', label: 'Dashboard', end: true, icon: 'M4 5h6v6H4zM14 5h6v6h-6zM4 13h6v6H4zM14 13h6v6h-6z' },
    { to: '/employer/match', label: 'Match Center', icon: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z' },
    { to: '/employer/pipeline', label: 'Pipeline', icon: 'M3 5h18M3 12h18M3 19h18' },
    { to: '/employer/messages', label: 'Messages', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
    { to: '/employer/post-job', label: 'Post New Job', icon: 'M12 5v14M5 12h14' },
    { to: '/employer/payments', label: 'Payments', icon: 'M3 7h18v10H3z M3 11h18' },
    { to: '/employer/support', label: 'Support', icon: 'M21 12a9 9 0 11-3-6.7M12 8v4l3 2' },
  ];

  const tierStyle = {
    trusted: { dot: 'bg-purple-400', text: 'text-purple-400', label: 'Trusted ★' },
    verified: { dot: 'bg-green-400', text: 'text-green-400', label: 'Verified' },
    basic: { dot: 'bg-amber-400', text: 'text-amber-400', label: 'Unverified' },
  }[tier];

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex">
      {/* ════════ SIDEBAR ════════ */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-navy text-white shrink-0">
        <div className="px-4 h-16 flex items-center gap-2 border-b border-white/5">
          <span className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-extrabold">
            Shram<span className="text-brand-orange">Setu</span>
          </span>
          <span className="ml-auto text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full">
            Employer View
          </span>
        </div>

        {/* Business card — real-time strength */}
        <div className="px-4 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center font-bold text-white overflow-hidden shrink-0">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate">
                {profile?.accountType === 'individual'
                  ? (profile?.fullName || 'Your profile')
                  : (profile?.businessName || 'Your business')}
              </p>
              <p className={`text-xs flex items-center gap-1 ${tierStyle.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tierStyle.dot}`} />
                {tierStyle.label}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Profile strength</span>
              <span className="font-semibold text-brand-orange">{strength}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-orange transition-all duration-500"
                style={{ width: `${strength}%` }}
              />
            </div>
            {nextAction && (
              <p className="text-[11px] text-slate-500 mt-2">{nextAction.label}</p>
            )}
            <Link
              to="/employer/profile/edit"
              className="mt-3 block text-center text-xs font-semibold text-brand-orange bg-orange-500/10 border border-brand-orange/30 rounded-lg py-2 hover:bg-orange-500/20 transition"
            >
              {strength < 100 ? 'Complete Profile →' : 'Edit Profile →'}
            </Link>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `mx-2 my-0.5 px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d={n.icon} />
              </svg>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 p-3">
          <button
            onClick={async () => {
              try { await api.post('/auth/logout'); } catch { }
              useProfileStore.getState().clear();
              logoutLocal();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l-5-5 5-5M5 12h14" />
            </svg>
            Collapse
          </button>
        </div>
      </aside>

      {/* ════════ MAIN ════════ */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 md:px-6 h-16 flex items-center gap-4">
            <div className="flex md:hidden items-center gap-2 font-extrabold text-brand-navy">
              <span className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </span>
            </div>

            <h1 className="hidden md:block text-xl font-extrabold text-slate-900">
              Employer Dashboard
            </h1>

            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
              <NotificationBell role="employer" />
              <UserMenu profile={profile} strength={strength} tier={tier} role="employer" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-[1200px] w-full mx-auto">
          <Outlet context={{ profile, strength, tier }} />
        </main>
      </div>
    </div>
  );
}