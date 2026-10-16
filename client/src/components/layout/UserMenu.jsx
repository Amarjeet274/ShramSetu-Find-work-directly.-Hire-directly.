import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User, Settings, HelpCircle, LogOut, ShieldCheck,
  Wallet, Award, ChevronRight, X,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';

export default function UserMenu({ profile, strength, tier, role = 'worker' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const initials = (profile?.fullName || '?')
    .split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  const tierMeta = {
    trusted:  { label: 'Trusted ★', color: 'text-purple-600', bg: 'bg-purple-50'  },
    verified: { label: 'Verified',  color: 'text-green-600',  bg: 'bg-green-50'   },
    basic:    { label: 'Unverified', color: 'text-amber-600', bg: 'bg-amber-50'   },
  }[tier] || { label: 'Unverified', color: 'text-amber-600', bg: 'bg-amber-50' };

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    try { await api.post('/auth/logout'); } catch {}
    useProfileStore.getState().clear();
    useAuthStore.getState().logoutLocal();
    navigate('/');
  };

  const links = [
    { to: `/${role}/profile`,       icon: User,          label: t('nav.profile',   { defaultValue: 'My Profile' }) },
    { to: `/${role}/earnings`,      icon: Wallet,        label: t('nav.earnings',  { defaultValue: 'Earnings' }) },
    { to: `/${role}/settings`,      icon: Settings,      label: t('nav.settings',  { defaultValue: 'Settings' }) },
    { to: `/${role}/support`,       icon: HelpCircle,    label: t('nav.support',   { defaultValue: 'Help & Support' }) },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="relative w-9 h-9 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-bold overflow-hidden ring-2 ring-transparent hover:ring-brand-orange/30 transition"
      >
        {profile?.photoUrl ? (
          <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />

          <div
            role="menu"
            className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-[fadeInUp_180ms_ease-out]"
          >
            {/* Header — user summary */}
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold overflow-hidden shrink-0">
                  {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-slate-900 truncate">
                    {profile?.fullName || 'Unnamed worker'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {profile?.address || 'Location not set'}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="md:hidden w-7 h-7 rounded-full hover:bg-slate-200 flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Tier + strength */}
              <div className="mt-3 flex items-center gap-2">
                <span className={`chip ${tierMeta.bg} ${tierMeta.color} text-[10px] font-bold`}>
                  <Award className="w-3 h-3" />
                  {tierMeta.label}
                </span>
                <span className="text-[11px] text-slate-500 ml-auto font-semibold">
                  {strength}% {t('worker.complete', { defaultValue: 'complete' })}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-orange transition-all duration-500"
                  style={{ width: `${strength}%` }}
                />
              </div>

              {strength < 100 && (
                <Link
                  to={`/${role}/profile/edit`}
                  onClick={() => setOpen(false)}
                  className="mt-3 flex items-center justify-between text-xs font-bold text-brand-orange hover:text-brand-orangeDark"
                >
                  {t('worker.completeProfile', { defaultValue: 'Complete your profile' })}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Menu links */}
            <div className="py-1.5">
              {links.map((l) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{l.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <div className="border-t border-slate-100 p-1.5">
              <button
                onClick={handleLogout}
                role="menuitem"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('auth.logout', { defaultValue: 'Sign out' })}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}