import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, User as UserIcon, MapPin, Mail, ShieldCheck, Wallet,
  Edit3, CheckCircle2, AlertCircle, ChevronRight, Award, Briefcase, Clock, Users, Phone, EyeOff
} from 'lucide-react';
import { useProfileStore } from '../../store/profileStore';
import {
  computeEmployerStrength,
  getEmployerTier,
  getNextEmployerAction,
} from '../../utils/employerProfileStrength';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function EmployerProfile() {
  const navigate = useNavigate();
  const { employerProfile: profile, loading, fetchEmployerProfile } = useProfileStore();

  useEffect(() => { fetchEmployerProfile(); }, [fetchEmployerProfile]);

  if (loading && !profile) return <LoadingSpinner />;

  if (!profile) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <p className="font-bold text-slate-900">Profile not found</p>
        <button onClick={() => navigate('/employer/profile/edit')} className="btn-primary mt-4">
          Create profile
        </button>
      </div>
    );
  }

  const strength = computeEmployerStrength(profile);
  const tier = getEmployerTier(strength);
  const nextAction = getNextEmployerAction(profile);

  const isBusiness = (profile.accountType || 'business') === 'business';
  const displayName = isBusiness
    ? profile.businessName || 'Unnamed business'
    : profile.fullName || 'Unnamed person';

  const initials = displayName
    .split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Strength card */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">Profile strength</span>
          <span className="text-sm font-bold text-brand-orange">{strength}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-brand-orange transition-all duration-500" style={{ width: `${strength}%` }} />
        </div>
        <div className="flex justify-between mt-3 text-[10px] font-semibold">
          <span className={strength >= 25 ? 'text-green-600' : 'text-slate-400'}>Basic</span>
          <span className={strength >= 55 ? 'text-green-600' : 'text-slate-400'}>Verified</span>
          <span className={strength >= 85 ? 'text-green-600' : 'text-slate-400'}>Trusted ★</span>
        </div>
        {nextAction && (
          <button
            onClick={() => navigate('/employer/profile/edit')}
            className="mt-4 w-full flex items-center justify-between bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl px-4 py-3 text-left transition"
          >
            <div>
              <p className="text-xs font-bold text-brand-orange">{nextAction.label}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {isBusiness ? 'Verified businesses get 4× more applicants' : 'Verified profiles get 3× more responses'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-orange" />
          </button>
        )}
      </div>

      {/* Identity */}
      <div className="card p-5">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 ${isBusiness ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
            }`}>
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-slate-900 truncate">{displayName}</h2>

            {/* Type badge */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className={`chip text-[11px] font-bold ${isBusiness ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-orange-100 text-orange-700 border border-orange-200'
                }`}>
                {isBusiness ? <Building2 className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                {isBusiness ? 'Business' : 'Individual'}
              </span>

              {tier === 'trusted' && (
                <span className="chip bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-bold">
                  <Award className="w-3 h-3" /> Trusted
                </span>
              )}
              {tier === 'verified' && (
                <span className="chip bg-green-100 text-green-700 border border-green-200 text-[11px] font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
              {tier === 'basic' && (
                <span className="chip bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold">
                  <AlertCircle className="w-3 h-3" /> Unverified
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{profile.address || 'Location not set'}</span>
            </p>
          </div>

          <button
            onClick={() => navigate('/employer/profile/edit')}
            className="shrink-0 w-10 h-10 rounded-xl border border-slate-300 hover:border-brand-orange hover:bg-orange-50 flex items-center justify-center transition"
            aria-label="Edit profile"
          >
            <Edit3 className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {(profile.description || profile.hireReason) && (
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            {isBusiness ? profile.description : profile.hireReason}
          </p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
          <Stat label="Rating" value={profile.rating ? profile.rating.toFixed(1) : '—'} icon={<Award className="w-4 h-4" />} />
          <Stat label="Jobs posted" value={profile.jobsPosted || 0} icon={<Briefcase className="w-4 h-4" />} />
          <Stat label="Workers hired" value={profile.workersHired || 0} icon={<UserIcon className="w-4 h-4" />} />
        </div>
      </div>

      {/* Contact */}
      <SectionCard title="Contact details" icon={<Mail className="w-4 h-4" />} onEdit={() => navigate('/employer/profile/edit')}>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2 text-slate-700">
            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
            {isBusiness
              ? profile.ownerName || <span className="italic text-slate-400">Owner name not set</span>
              : profile.fullName || <span className="italic text-slate-400">Name not set</span>}
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            {profile.email || <span className="italic text-slate-400">Email not set</span>}
          </li>
          <li className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {profile.address || <span className="italic text-slate-400">Address not set</span>}
          </li>
        </ul>
      </SectionCard>

      {/* Business OR Individual details */}
      {isBusiness ? (
        <SectionCard title="Business details" icon={<Building2 className="w-4 h-4" />} onEdit={() => navigate('/employer/profile/edit')}>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-slate-700">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              {profile.businessType
                ? profile.businessType.charAt(0).toUpperCase() + profile.businessType.slice(1)
                : <span className="italic text-slate-400">Type not set</span>}
            </li>
            <li className="flex items-center gap-2 text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {profile.yearsInBusiness
                ? `${profile.yearsInBusiness}+ years in business`
                : <span className="italic text-slate-400">Years not set</span>}
            </li>
            {profile.employeeCount && (
              <li className="flex items-center gap-2 text-slate-700">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                {profile.employeeCount} workers
              </li>
            )}
          </ul>
        </SectionCard>
      ) : (
        <SectionCard title="What you need" icon={<UserIcon className="w-4 h-4" />} onEdit={() => navigate('/employer/profile/edit')}>
          <ul className="space-y-2 text-sm">
            <li className="text-slate-700">
              {profile.hireReason || <span className="italic text-slate-400">Not specified</span>}
            </li>
            {profile.householdSize && (
              <li className="text-xs text-slate-500">
                Household size: {profile.householdSize} people
              </li>
            )}
          </ul>
        </SectionCard>
      )}
      {/* Hiring categories + contact */}
      <SectionCard
        title={isBusiness ? 'Who you hire' : 'What you need'}
        icon={<Users className="w-4 h-4" />}
        onEdit={() => navigate('/employer/profile/edit')}
      >
        {profile.hiringCategories?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.hiringCategories.map((c) => (
              <span key={c} className="chip bg-orange-50 text-brand-orange border border-orange-200 font-semibold">
                {c.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No categories selected</p>
        )}

        {profile.contactPhone && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-sm">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-slate-700">
              +91 {profile.contactPhone}
            </span>
            {!profile.showContact && (
              <span className="chip bg-slate-100 text-slate-500 text-[10px] ml-auto">
                <EyeOff className="w-3 h-3" /> Hidden from workers
              </span>
            )}
          </div>
        )}
      </SectionCard>
      {/* Verification — adaptive */}
      <SectionCard title="Verification" icon={<ShieldCheck className="w-4 h-4" />} onEdit={() => navigate('/employer/profile/edit')}>
        <ul className="space-y-2">
          {isBusiness ? (
            <>
              <VerifyRow ok={!!profile.businessName} label="Business name" />
              <VerifyRow ok={!!profile.gstNumber} label="GST number" />
              <VerifyRow ok={!!profile.panNumber} label="PAN number" />
              <VerifyRow ok={!!profile.businessDocUrl} label="Business document" />
              <VerifyRow ok={!!profile.selfieUrl} label="Owner selfie" />
              <VerifyRow ok={!!profile.verification?.businessVerified} label="Reviewed & approved" />
            </>
          ) : (
            <>
              <VerifyRow ok={!!profile.fullName} label="Full name" />
              <VerifyRow ok={!!profile.idType && !!profile.idNumber} label="Government ID" />
              <VerifyRow ok={!!profile.idDocUrl} label="ID document uploaded" />
              <VerifyRow ok={!!profile.selfieUrl} label="Selfie captured" />
              <VerifyRow ok={!!profile.verification?.businessVerified} label="Reviewed & approved" />
            </>
          )}
        </ul>
      </SectionCard>

      {/* Payment */}
      <SectionCard
        title="Payment method"
        icon={<Wallet className="w-4 h-4" />}
        empty={!profile.upiId && !profile.bankAccount}
        emptyText="No payment method added"
        onEdit={() => navigate('/employer/profile/edit')}
      >
        {profile.upiId && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">UPI</span>
            <span className="text-sm font-mono text-slate-600">{profile.upiId}</span>
          </div>
        )}
        {profile.bankAccount && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-semibold text-slate-700">Bank</span>
            <span className="text-sm font-mono text-slate-600">••••{profile.bankAccount.slice(-4)}</span>
          </div>
        )}
      </SectionCard>

      <button
        onClick={() => navigate('/employer/profile/edit')}
        className="btn-primary w-full !min-h-[56px] text-base"
      >
        <Edit3 className="w-5 h-5" />
        {strength < 100 ? 'Complete your profile' : 'Edit profile'}
      </button>

      <div className="h-4" />
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">{icon}</div>
      <p className="text-xl font-extrabold text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function SectionCard({ title, icon, children, onEdit, empty, emptyText }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">{icon}</span>
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        </div>
        {onEdit && (
          <button onClick={onEdit} className="text-xs font-semibold text-brand-orange hover:text-brand-orangeDark">
            Edit
          </button>
        )}
      </div>
      {empty ? <p className="text-sm text-slate-400 italic">{emptyText}</p> : children}
    </div>
  );
}

function VerifyRow({ ok, label }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
      )}
      <span className={ok ? 'text-slate-700' : 'text-slate-500'}>{label}</span>
    </li>
  );
}