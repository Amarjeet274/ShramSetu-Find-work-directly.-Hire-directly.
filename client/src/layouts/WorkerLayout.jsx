import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  User as UserIcon,
  Edit3,
  Briefcase,
  Wallet,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import {
  computeProfileStrength,
  getProfileTier,
  getNextProfileAction,
} from '../utils/profileStrength';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api from '../services/api';
import UserMenu from '../components/layout/UserMenu';
import NotificationBell from '../components/layout/NotificationBell';

export default function WorkerLayout() {
  const { t } = useTranslation();
  const { user, logoutLocal } = useAuthStore();
  const navigate = useNavigate();

  /* ── Shared profile store ── */
  const { profile, fetchProfile } = useProfileStore();
  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /* ── Profile dropdown state ── */
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Close on route change
  const location = useNavigate(); // not used directly but keeps parity; remove if unused
  // Actually use location from react-router:
  // We'll skip — nav via <Link> closes the menu below.

  /* ── Derived values ── */
  const strength = computeProfileStrength(profile);
  const tier = getProfileTier(strength);
  const nextAction = getNextProfileAction(profile);

  const initials = (profile?.fullName || '?')
    .split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  const maskedPhone = user?.phone
    ? `+91 •••• ${user.phone.slice(-4)}`
    : '';

  const nav = [
    { to: '/worker', icon: 'M4 5h6v6H4zM14 5h6v6h-6zM4 13h6v6H4zM14 13h6v6h-6z', label: t('worker.jobMatches', { defaultValue: 'Job Matches' }), end: true },
    { to: '/worker/applications', icon: 'M8 4h8l2 2v14H6V4h2z', label: t('nav.applications', { defaultValue: 'Applications' }) },
    { to: '/worker/saved', icon: 'M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z', label: t('nav.savedJobs', { defaultValue: 'Saved Jobs' }) },
    { to: '/worker/earnings', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2', label: t('worker.earningsTitle', { defaultValue: 'Earnings' }) },
    { to: '/worker/ratings', icon: 'M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z', label: t('worker.ratingsTitle', { defaultValue: 'Ratings' }) },
    { to: '/worker/support', icon: 'M21 12a9 9 0 11-3-6.7M12 8v4l3 2', label: t('nav.support', { defaultValue: 'Support' }) },
  ];

  const tierStyle = {
    trusted: { dot: 'bg-purple-400', text: 'text-purple-400', key: 'worker.tierTrusted', label: 'Trusted ★' },
    verified: { dot: 'bg-green-400', text: 'text-green-400', key: 'worker.tierVerified', label: 'Verified' },
    basic: { dot: 'bg-amber-400', text: 'text-amber-400', key: 'worker.tierBasic', label: 'Unverified' },
  }[tier];

  const hintFor = (action) => {
    if (!action) return null;
    const map = {
      name: { key: 'worker.addName', def: 'Add your full name' },
      photo: { key: 'worker.addPhoto', def: 'Add a face photo' },
      skills: { key: 'worker.addSkills', def: 'Add at least one skill' },
      address: { key: 'worker.addAddress', def: 'Add your area' },
      aadhaar: { key: 'worker.addAadhaar', def: 'Add Aadhaar to reach 85%' },
      payment: { key: 'worker.addPayment', def: 'Add payment to reach 100%' },
      basic: { key: 'worker.startProfile', def: 'Start your profile' },
    };
    const entry = map[action.key] || map.basic;
    return t(entry.key, { defaultValue: entry.def });
  };

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch { }
    useProfileStore.getState().clear();
    logoutLocal();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex">
      {/*SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-brand-navy text-white shrink-0">
        <div className="px-4 h-16 flex items-center gap-2 border-b border-white/5">
          <span className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-extrabold">
            Shram<span className="text-brand-orange">Setu</span>
          </span>
          <span className="ml-auto text-[10px] font-bold text-brand-orange bg-orange-500/10 border border-brand-orange/30 px-2 py-0.5 rounded-full">
            {t('worker.viewBadge', { defaultValue: 'Worker View' })}
          </span>
        </div>

        {/* Profile card */}
        <div className="px-4 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center font-bold text-white overflow-hidden shrink-0">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm truncate">
                {profile?.fullName || t('worker.unnamed', { defaultValue: 'Unnamed worker' })}
              </p>
              <p className={`text-xs flex items-center gap-1 ${tierStyle.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tierStyle.dot}`} />
                {t(tierStyle.key, { defaultValue: tierStyle.label })}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>{t('worker.profileStrength', { defaultValue: 'Profile strength' })}</span>
              <span className="font-semibold text-brand-orange">{strength}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-brand-orange transition-all duration-500" style={{ width: `${strength}%` }} />
            </div>
            {nextAction && (
              <p className="text-[11px] text-slate-500 mt-2">{hintFor(nextAction)}</p>
            )}
            <Link
              to="/worker/profile/edit"
              className="mt-3 block text-center text-xs font-semibold text-brand-orange bg-orange-500/10 border border-brand-orange/30 rounded-lg py-2 hover:bg-orange-500/20 transition"
            >
              {strength < 100
                ? t('worker.completeProfile', { defaultValue: 'Complete Profile →' })
                : t('worker.editProfile', { defaultValue: 'Edit Profile →' })}
            </Link>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `mx-2 my-0.5 px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition ${isActive ? 'bg-brand-orange text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
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
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l-5-5 5-5M5 12h14" />
            </svg>
            {t('common.collapse', { defaultValue: 'Collapse' })}
          </button>
        </div>
      </aside>

      {/* ═══════════════════ MAIN ═══════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 md:px-6 h-16 flex items-center gap-4">
            <div className="flex md:hidden items-center gap-2 font-extrabold text-brand-navy">
              <span className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </span>
            </div>

            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">🔍</span>
              <input
                placeholder={t('worker.searchTopbar', { defaultValue: 'Search jobs, type, location…' })}
                className="w-full h-10 pl-9 pr-10 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-orange"
                aria-label={t('landing.voiceSearch', { defaultValue: 'Voice search' })}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19v3M8 22h8M12 15a4 4 0 004-4V6a4 4 0 00-8 0v5a4 4 0 004 4z" />
                </svg>
              </button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
              <NotificationBell role="worker" />
              <UserMenu profile={profile} strength={strength} tier={tier} role="worker" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-[1200px] w-full mx-auto">
          <Outlet context={{ profile, strength, tier }} />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
          <div className="grid grid-cols-5">
            {[
              { to: '/worker', label: t('nav.home', { defaultValue: 'Home' }), end: true, icon: 'M3 11l9-8 9 8v10a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2V11z' },
              { to: '/worker/find', label: t('nav.work', { defaultValue: 'Work' }), icon: 'M11 4a7 7 0 105 12l4 4' },
              { to: '/worker/applications', label: t('nav.applications', { defaultValue: 'Apps' }), icon: 'M8 4h8l2 2v14H6V4h2z' },
              { to: '/worker/messages', label: t('nav.messages', { defaultValue: 'Chat' }), icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
              { to: '/worker/profile', label: t('nav.profile', { defaultValue: 'You' }), icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0' },
            ].map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-2.5 min-h-[60px] gap-0.5 text-[10px] font-semibold ${isActive ? 'text-brand-orange' : 'text-slate-500'
                  }`
                }
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d={n.icon} />
                </svg>
                {n.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ── Dropdown menu item ── */
function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition ${danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-slate-700 hover:bg-slate-50'
        }`}
    >
      <span className={danger ? 'text-red-500' : 'text-slate-500'}>{icon}</span>
      {label}
    </button>
  );
}