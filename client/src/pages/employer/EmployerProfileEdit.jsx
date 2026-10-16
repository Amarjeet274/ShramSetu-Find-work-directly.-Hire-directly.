import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2, User as UserIcon, MapPin, Briefcase, ShieldCheck, Wallet,
  ChevronLeft, ChevronRight, Check, Camera, Upload, Loader2, AlertCircle,
  CheckCircle2, Navigation, RefreshCw, FileText, Aperture, Lock, Mail,
  Phone, Eye, EyeOff, Users,
} from 'lucide-react';
import api from '../../services/api';
import { useProfileStore } from '../../store/profileStore';
import { computeEmployerStrength } from '../../utils/employerProfileStrength';

const STEPS_BUSINESS = [
  { key: 'type', icon: Briefcase, label: 'Type' },
  { key: 'basic', icon: Building2, label: 'Business' },
  { key: 'location', icon: MapPin, label: 'Location' },
  { key: 'details', icon: FileText, label: 'Details' },
  { key: 'verify', icon: ShieldCheck, label: 'Verify' },
  { key: 'payment', icon: Wallet, label: 'Payment' },
];

const STEPS_INDIVIDUAL = [
  { key: 'type', icon: Briefcase, label: 'Type' },
  { key: 'basic', icon: UserIcon, label: 'You' },
  { key: 'location', icon: MapPin, label: 'Location' },
  { key: 'details', icon: FileText, label: 'Needs' },
  { key: 'verify', icon: ShieldCheck, label: 'Verify' },
  { key: 'payment', icon: Wallet, label: 'Payment' },
];

const BUSINESS_TYPES = [
  { key: 'restaurant', label: 'Restaurant / Cafe' },
  { key: 'grocery', label: 'Grocery / Kirana' },
  { key: 'warehouse', label: 'Warehouse / Logistics' },
  { key: 'construction', label: 'Construction' },
  { key: 'retail', label: 'Retail Shop' },
  { key: 'ecommerce', label: 'E-commerce' },
  { key: 'services', label: 'Home Services' },
  { key: 'events', label: 'Events / Catering' },
  { key: 'factory', label: 'Factory' },
  { key: 'other', label: 'Other' },
];

const INDUSTRIES = [
  'Delivery', 'Food & Beverage', 'Retail', 'Manufacturing',
  'Construction', 'Hospitality', 'Logistics', 'Healthcare', 'Other',
];

const HIRING_CATEGORIES = [
  { key: 'delivery', label: 'Delivery' },
  { key: 'driver', label: 'Driver' },
  { key: 'helper', label: 'Helper' },
  { key: 'plumber', label: 'Plumber' },
  { key: 'electrician', label: 'Electrician' },
  { key: 'carpenter', label: 'Carpenter' },
  { key: 'painter', label: 'Painter' },
  { key: 'mason', label: 'Mason / Mistri' },
  { key: 'cook', label: 'Cook' },
  { key: 'security', label: 'Security Guard' },
  { key: 'domesticHelp', label: 'Domestic Help' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'construction', label: 'Construction' },
];

const ID_TYPES = [
  { key: 'aadhaar', label: 'Aadhaar Card' },
  { key: 'voter', label: 'Voter ID' },
  { key: 'dl', label: 'Driving License' },
  { key: 'pan', label: 'PAN Card' },
];

export default function EmployerProfileEdit() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { employerProfile, setEmployerProfile } = useProfileStore();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle');

  const [form, setForm] = useState({
    /* Type */
    accountType: null,

    /* Business */
    businessName: '',
    businessType: '',
    ownerName: '',
    yearsInBusiness: 0,
    employeeCount: '',
    industry: '',
    gstNumber: '',
    panNumber: '',
    businessDocUrl: '',

    /* Individual */
    fullName: '',
    hireReason: '',
    householdSize: '',
    idType: '',
    idNumber: '',
    idDocUrl: '',

    /* Shared */
    email: '',
    photoUrl: '',
    selfieUrl: '',
    address: '',
    lng: null,
    lat: null,
    serviceRadiusKm: 10,
    description: '',
    upiId: '',
    bankAccount: '',
    ifsc: '',

    /* Hiring preferences */
    hiringCategories: [],
    contactPhone: '',
    showContact: true,
  });

  useEffect(() => {
    if (employerProfile) {
      setForm((f) => ({ ...f, ...employerProfile }));
    }
  }, [employerProfile]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const isBusiness = form.accountType === 'business';
  const STEPS = isBusiness ? STEPS_BUSINESS : STEPS_INDIVIDUAL;

  /* Save the current step */
  const saveStep = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        accountType: form.accountType,
        email: form.email,
        photoUrl: form.photoUrl,
        address: form.address,
        lng: form.lng,
        lat: form.lat,
        serviceRadiusKm: form.serviceRadiusKm,
        description: form.description,
        upiId: form.upiId,
        /* Hiring preferences */
        hiringCategories: Array.isArray(form.hiringCategories) ? form.hiringCategories : [],
        contactPhone: form.contactPhone || '',
        showContact: typeof form.showContact === 'boolean' ? form.showContact : true,
      };

      if (isBusiness) {
        Object.assign(payload, {
          businessName: form.businessName,
          businessType: form.businessType,
          ownerName: form.ownerName,
          industry: form.industry,
          yearsInBusiness: form.yearsInBusiness,
          employeeCount: form.employeeCount,
          gstNumber: form.gstNumber,
          panNumber: form.panNumber,
        });
      } else {
        Object.assign(payload, {
          fullName: form.fullName,
          hireReason: form.hireReason,
          householdSize: form.householdSize,
          idType: form.idType,
          idNumber: form.idNumber,
        });
      }

      const { data } = await api.patch('/employers/me', payload);
      if (data.profile) setEmployerProfile(data.profile);

      setSuccess('Saved');
      setTimeout(() => setSuccess(''), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    /* Block step 0 if no type chosen */
    if (step === 0 && !form.accountType) {
      setError('Please choose whether you are a business or an individual.');
      return;
    }
    try {
      await saveStep();
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    } catch { }
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = async () => {
    try {
      await saveStep();
      navigate('/employer/profile');
    } catch { }
  };

  const strength = computeEmployerStrength(form);

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/employer/profile')}
          className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-slate-900">
            {t('employer.completeProfile', { defaultValue: 'Complete your profile' })}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
      </div>

      {/* Strength bar */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">Profile strength</span>
          <span className="text-xs font-bold text-brand-orange">{strength}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-brand-orange transition-all duration-500" style={{ width: `${strength}%` }} />
        </div>
        <div className="flex justify-between mt-3 text-[10px] font-semibold">
          <span className={strength >= 25 ? 'text-green-600' : 'text-slate-400'}>Basic</span>
          <span className={strength >= 55 ? 'text-green-600' : 'text-slate-400'}>Verified</span>
          <span className={strength >= 85 ? 'text-green-600' : 'text-slate-400'}>Trusted ★</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-thin">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <button
              key={s.key}
              onClick={() => i <= step && setStep(i)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition ${active ? 'bg-brand-orange text-white'
                : done ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-500'
                }`}
            >
              {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              <span className="whitespace-nowrap">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="card p-5">
        {step === 0 && <StepType form={form} update={update} />}

        {step === 1 && (isBusiness
          ? <StepBusiness form={form} update={update} />
          : <StepIndividual form={form} update={update} />)}

        {step === 2 && (
          <StepLocation form={form} update={update} locationStatus={locationStatus} setLocationStatus={setLocationStatus} />
        )}

        {step === 3 && (isBusiness
          ? <StepBusinessDetails form={form} update={update} />
          : <StepIndividualDetails form={form} update={update} />)}

        {step === 4 && <StepVerify form={form} update={update} setSuccess={setSuccess} isBusiness={isBusiness} />}

        {step === 5 && <StepPayment form={form} update={update} />}
      </div>

      {/* Feedback */}
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mt-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Nav */}
      <div className="bottom-0 m-0.5 left-0 right-0 bg-white border-t border-slate-200 p-4 z-30 rounded-xl">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-2">
          {step > 0 && (
            <button onClick={back} className="btn-secondary !min-h-[48px] px-5">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={next} disabled={saving} className="btn-primary flex-1 !min-h-[48px]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={finish} disabled={saving} className="btn-primary flex-1 !min-h-[48px]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* STEP 0 — TYPE CHOOSER═ */

function StepType({ form, update }) {
  const options = [
    {
      key: 'business',
      icon: Building2,
      title: 'Business / Shop / Company',
      desc: 'You own or manage a shop, restaurant, factory, warehouse or company that hires workers.',
      examples: 'e.g. QuickMart Grocery, Sri Ram Builders, Cafe Coffee Day',
    },
    {
      key: 'individual',
      icon: UserIcon,
      title: 'Individual / Family',
      desc: 'You are hiring personally — for your home, family, or a personal project.',
      examples: 'e.g. Need a cook for home, Need a driver, Need help moving',
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-extrabold text-lg text-slate-900">Who are you?</h2>
        <p className="text-sm text-slate-500 mt-1">
          This helps us ask for the right details. You can change it later.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((o) => {
          const Icon = o.icon;
          const selected = form.accountType === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => update({ accountType: o.key })}
              className={`w-full text-left rounded-2xl border-2 p-4 transition ${selected
                ? 'border-brand-orange bg-orange-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-[15px] ${selected ? 'text-brand-orange' : 'text-slate-900'}`}>
                    {o.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{o.desc}</p>
                  <p className="text-[11px] text-slate-400 mt-2 italic">{o.examples}</p>
                </div>
                {selected && <Check className="w-5 h-5 text-brand-orange shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Businesses get a GST-based verification. Individuals get ID-based verification.
          Both receive the same green verified badge.
        </p>
      </div>
    </div>
  );
}

/* BUSINESS — STEP 1 */

function StepBusiness({ form, update }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/uploads/single', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      update({ photoUrl: data.file.url });
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-extrabold text-lg text-slate-900">Tell us about your business</h2>
        <p className="text-sm text-slate-500 mt-1">
          Workers will see this on your job posts.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-28 h-28 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 hover:border-brand-orange flex items-center justify-center overflow-hidden transition"
        >
          {form.photoUrl ? (
            <img src={form.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : uploading ? (
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          ) : (
            <div className="text-center">
              <Camera className="w-7 h-7 text-slate-400 mx-auto" />
              <span className="text-[10px] text-slate-500 mt-1 block">Add logo</span>
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={upload} className="hidden" />
        <p className="text-[11px] text-slate-500 mt-2">Logo or shopfront photo</p>
      </div>

      <Field
        label="Business name"
        required
        value={form.businessName}
        onChange={(v) => update({ businessName: v })}
        placeholder="e.g. QuickMart Grocery"
      />

      <div>
        <label className="label">Business type <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 gap-2">
          {BUSINESS_TYPES.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => update({ businessType: b.key })}
              className={`min-h-[48px] rounded-xl border-2 text-sm font-semibold transition px-3 ${form.businessType === b.key
                ? 'border-brand-orange bg-orange-50 text-brand-orange'
                : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <Field
        label="Owner / manager name"
        value={form.ownerName}
        onChange={(v) => update({ ownerName: v })}
        placeholder="Full name"
      />

      <Field
        label="Business email"
        type="email"
        value={form.email}
        onChange={(v) => update({ email: v })}
        placeholder="contact@yourbusiness.com"
      />

      {/* Contact phone */}
      <div>
        <label className="label">Contact phone</label>
        <div className="flex gap-2">
          <div className="flex items-center px-4 border border-slate-300 rounded-xl bg-slate-50 font-semibold text-slate-700 shrink-0">
            +91
          </div>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={form.contactPhone || ''}
            onChange={(e) => update({ contactPhone: e.target.value.replace(/\D/g, '') })}
            placeholder="10-digit mobile number"
            className="input flex-1"
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5">
          Workers will use this to reach you about jobs
        </p>

        {/* Show/hide toggle */}
        <label className="mt-3 flex items-center gap-3 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => update({ showContact: !form.showContact })}
            role="switch"
            aria-checked={form.showContact}
            className={`relative w-11 h-6 rounded-full transition ${form.showContact ? 'bg-brand-orange' : 'bg-slate-300'
              }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.showContact ? 'left-[22px]' : 'left-0.5'
                }`}
            />
          </button>
          <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            {form.showContact ? <Eye className="w-4 h-4 text-brand-orange" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            {form.showContact ? 'Show my phone number publicly' : 'Hide my phone number'}
          </span>
        </label>
      </div>
    </div>
  );
}

/* INDIVIDUAL — STEP 1*/

function StepIndividual({ form, update }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/uploads/single', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      update({ photoUrl: data.file.url });
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-extrabold text-lg text-slate-900">About you</h2>
        <p className="text-sm text-slate-500 mt-1">
          Workers need to know who they're working for. A clear photo builds trust.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative w-28 h-28 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 hover:border-brand-orange flex items-center justify-center overflow-hidden transition"
        >
          {form.photoUrl ? (
            <img src={form.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : uploading ? (
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          ) : (
            <div className="text-center">
              <Camera className="w-7 h-7 text-slate-400 mx-auto" />
              <span className="text-[10px] text-slate-500 mt-1 block">Add photo</span>
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={upload} className="hidden" />
        <p className="text-[11px] text-slate-500 mt-2">Your face photo (helps workers trust you)</p>
      </div>

      <Field
        label="Your full name"
        required
        value={form.fullName}
        onChange={(v) => update({ fullName: v })}
        placeholder="e.g. Ramesh Kumar"
      />

      <Field
        label="Email"
        type="email"
        value={form.email}
        onChange={(v) => update({ email: v })}
        placeholder="you@example.com"
        hint="For job confirmations and receipts"
      />
      {/* Contact phone */}
      <div>
        <label className="label">Contact phone</label>
        <div className="flex gap-2">
          <div className="flex items-center px-4 border border-slate-300 rounded-xl bg-slate-50 font-semibold text-slate-700 shrink-0">
            +91
          </div>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={form.contactPhone || ''}
            onChange={(e) => update({ contactPhone: e.target.value.replace(/\D/g, '') })}
            placeholder="10-digit mobile number"
            className="input flex-1"
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5">
          Workers will use this to reach you about jobs
        </p>

        {/* Show/hide toggle */}
        <label className="mt-3 flex items-center gap-3 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => update({ showContact: !form.showContact })}
            role="switch"
            aria-checked={form.showContact}
            className={`relative w-11 h-6 rounded-full transition ${form.showContact ? 'bg-brand-orange' : 'bg-slate-300'
              }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.showContact ? 'left-[22px]' : 'left-0.5'
                }`}
            />
          </button>
          <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            {form.showContact ? <Eye className="w-4 h-4 text-brand-orange" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            {form.showContact ? 'Show my phone number publicly' : 'Hide my phone number'}
          </span>
        </label>
      </div>
    </div>
  );
}

/* STEP 2 — LOCATION (shared)*/

function StepLocation({ form, update, locationStatus, setLocationStatus }) {
  const fetchLocation = () => {
    if (!navigator.geolocation) { setLocationStatus('error'); return; }
    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        update({ lat: latitude, lng: longitude });
        setLocationStatus('geocoding');
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;
          const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
          const data = await res.json();
          const a = data.address || {};
          const short = [a.suburb || a.neighbourhood || a.village, a.city || a.town || a.county]
            .filter(Boolean).join(', ');
          if (short) update({ address: short });
          setLocationStatus('success');
        } catch { setLocationStatus('success'); }
      },
      () => setLocationStatus('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => { if (!form.lng) fetchLocation(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-extrabold text-lg text-slate-900">Where are you located?</h2>
        <p className="text-sm text-slate-500 mt-1">
          Only workers near you will see your jobs.
        </p>
      </div>

      <div
        className={`rounded-xl border-2 p-4 transition ${locationStatus === 'success' ? 'border-green-300 bg-green-50'
          : locationStatus === 'error' ? 'border-red-300 bg-red-50'
            : 'border-slate-200 bg-slate-50'
          }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${locationStatus === 'success' ? 'bg-green-100 text-green-700'
            : locationStatus === 'error' ? 'bg-red-100 text-red-700'
              : 'bg-white text-slate-500'
            }`}>
            {locationStatus === 'locating' || locationStatus === 'geocoding' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : locationStatus === 'success' ? <CheckCircle2 className="w-5 h-5" />
              : locationStatus === 'error' ? <AlertCircle className="w-5 h-5" />
                : <MapPin className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-slate-900">
              {locationStatus === 'locating' && 'Finding your location…'}
              {locationStatus === 'geocoding' && 'Getting your area…'}
              {locationStatus === 'success' && 'Location captured'}
              {locationStatus === 'error' && 'Could not detect location'}
              {locationStatus === 'idle' && 'Location not set'}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {form.lat && form.lng
                ? `${form.lat.toFixed(4)}, ${form.lng.toFixed(4)}`
                : 'Tap the button below to use your current location'}
            </p>
          </div>
          {locationStatus !== 'locating' && locationStatus !== 'geocoding' && (
            <button
              type="button"
              onClick={fetchLocation}
              className="shrink-0 bg-brand-orange hover:bg-brand-orangeDark text-white text-xs font-bold rounded-lg px-3 py-2 flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              Use my location
            </button>
          )}
        </div>
      </div>

      <Field
        label="Address"
        required
        value={form.address}
        onChange={(v) => update({ address: v })}
        placeholder="Street, area, city"
        hint="Auto-filled from GPS — edit if needed"
      />

      <div>
        <label className="label">Service radius</label>
        <p className="text-xs text-slate-500 mb-2">Only workers within this distance see your jobs.</p>
        <div className="grid grid-cols-4 gap-2">
          {[2, 5, 10, 20].map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => update({ serviceRadiusKm: km })}
              className={`min-h-[48px] rounded-xl border-2 text-sm font-semibold transition ${form.serviceRadiusKm === km
                ? 'border-brand-orange bg-orange-50 text-brand-orange'
                : 'border-slate-200 text-slate-700'
                }`}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/*BUSINESS — STEP 3 */

function StepBusinessDetails({ form, update }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-extrabold text-lg text-slate-900">Business details</h2>
        <p className="text-sm text-slate-500 mt-1">Help workers understand your operation.</p>
      </div>

      {/* What kind of workers do you hire? */}
      <div>
        <label className="label">
          Who do you hire? <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Pick all categories of workers you hire for. Workers will match with you based on this.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {HIRING_CATEGORIES.map((c) => {
            const on = form.hiringCategories?.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() =>
                  update({
                    hiringCategories: on
                      ? form.hiringCategories.filter((k) => k !== c.key)
                      : [...(form.hiringCategories || []), c.key],
                  })
                }
                className={`min-h-[48px] rounded-xl border-2 text-sm font-semibold transition px-3 flex items-center gap-2 ${on
                  ? 'border-brand-orange bg-orange-50 text-brand-orange'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
              >
                {on && <Check className="w-4 h-4 shrink-0" />}
                <span className="truncate">{c.label}</span>
              </button>
            );
          })}
        </div>
        {form.hiringCategories?.length > 0 && (
          <p className="text-[11px] text-slate-500 mt-2">
            {form.hiringCategories.length} categor{form.hiringCategories.length === 1 ? 'y' : 'ies'} selected
          </p>
        )}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="What does your business do? What kind of workers do you hire? How often?"
          className="input min-h-[120px] py-3"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          {form.description?.length || 0}/2000 · min 30 characters
        </p>
      </div>

      <div>
        <label className="label">Industry</label>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => update({ industry: i })}
              className={`chip border-2 ${form.industry === i
                ? 'border-brand-orange bg-orange-50 text-brand-orange'
                : 'border-slate-200 text-slate-700'
                }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Years in business</label>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 5, 10, 20].map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => update({ yearsInBusiness: y })}
              className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition ${form.yearsInBusiness === y
                ? 'border-brand-orange bg-orange-50 text-brand-orange'
                : 'border-slate-200 text-slate-700'
                }`}
            >
              {y === 0 ? 'New' : `${y}+ years`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Business size</label>
        <div className="grid grid-cols-2 gap-2">
          {['1-5', '6-20', '21-100', '100+'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update({ employeeCount: s })}
              className={`min-h-[48px] rounded-xl border-2 text-sm font-semibold transition ${form.employeeCount === s
                ? 'border-brand-orange bg-orange-50 text-brand-orange'
                : 'border-slate-200 text-slate-700'
                }`}
            >
              {s} workers
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* INDIVIDUAL — STEP 3 */

function StepIndividualDetails({ form, update }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-extrabold text-lg text-slate-900">What do you need?</h2>
        <p className="text-sm text-slate-500 mt-1">Be clear so the right workers find you.</p>
      </div>

      {/* What kind of workers do you hire? */}
      <div>
        <label className="label">
          Who do you hire? <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Pick all categories of workers you hire for. Workers will match with you based on this.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {HIRING_CATEGORIES.map((c) => {
            const on = form.hiringCategories?.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                onClick={() =>
                  update({
                    hiringCategories: on
                      ? form.hiringCategories.filter((k) => k !== c.key)
                      : [...(form.hiringCategories || []), c.key],
                  })
                }
                className={`min-h-[48px] rounded-xl border-2 text-sm font-semibold transition px-3 flex items-center gap-2 ${on
                  ? 'border-brand-orange bg-orange-50 text-brand-orange'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
              >
                {on && <Check className="w-4 h-4 shrink-0" />}
                <span className="truncate">{c.label}</span>
              </button>
            );
          })}
        </div>
        {form.hiringCategories?.length > 0 && (
          <p className="text-[11px] text-slate-500 mt-2">
            {form.hiringCategories.length} categor{form.hiringCategories.length === 1 ? 'y' : 'ies'} selected
          </p>
        )}
      </div>

      <div>
        <label className="label">Tell us what you're looking for <span className="text-red-500">*</span></label>
        <textarea
          value={form.hireReason}
          onChange={(e) => update({ hireReason: e.target.value })}
          placeholder="e.g. I need a cook for my family of 4, 2 meals a day. Preferably someone with 2+ years experience."
          className="input min-h-[120px] py-3"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          {form.hireReason?.length || 0}/500 · min 20 characters
        </p>
      </div>

      <div>
        <label className="label">Household size (optional)</label>
        <div className="flex flex-wrap gap-2">
          {['1', '2-4', '5-7', '8+'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update({ householdSize: s })}
              className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition ${form.householdSize === s
                ? 'border-brand-orange bg-orange-50 text-brand-orange'
                : 'border-slate-200 text-slate-700'
                }`}
            >
              {s} people
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* STEP 4 — VERIFY (adaptive)*/

function StepVerify({ form, update, setSuccess, isBusiness }) {
  const bizRef = useRef(null);
  const idRef = useRef(null);
  const selfieRef = useRef(null);
  const [uploading, setUploading] = useState({ doc: false, id: false, selfie: false });

  const upload = async (kind, file, field) => {
    if (!file) return;
    setUploading((u) => ({ ...u, [kind]: true }));
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/uploads/single', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      update({ [field]: data.file.url });
    } catch { alert('Upload failed'); }
    finally { setUploading((u) => ({ ...u, [kind]: false })); }
  };

  const submitVerification = async () => {
    try {
      const payload = isBusiness
        ? {
          documentUrl: form.businessDocUrl,
          selfieUrl: form.selfieUrl,
          gstNumber: form.gstNumber,
          panNumber: form.panNumber,
        }
        : {
          idDocUrl: form.idDocUrl,
          selfieUrl: form.selfieUrl,
          idType: form.idType,
          idNumber: form.idNumber,
        };
      await api.post('/employers/me/verification', payload);
      setSuccess('✓ Submitted for verification. Our team will review within 24 hours.');
    } catch (e) {
      alert(e.response?.data?.message || 'Submission failed');
    }
  };

  const canSubmit = isBusiness
    ? form.businessDocUrl && form.selfieUrl
    : form.idDocUrl && form.selfieUrl && form.idType && form.idNumber;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-orange" />
          {isBusiness ? 'Verify your business' : 'Verify your identity'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {isBusiness
            ? 'Verified businesses attract 4× more applicants and rank first in searches.'
            : 'Verified individuals get 3× more responses from workers.'}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 flex items-start gap-3">
        <Lock className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-bold mb-1">Why we verify?</p>
          <p className="text-xs leading-relaxed">
            {isBusiness
              ? 'Verification keeps fake profiles and middlemen out. Your documents are encrypted and never shared with workers.'
              : 'Verification keeps fake accounts and middlemen out. Your ID is encrypted and never shared with workers — only the verified badge is shown.'}
          </p>
        </div>
      </div>

      {isBusiness ? (
        <>
          <Field
            label="GST number (optional)"
            value={form.gstNumber}
            onChange={(v) => update({ gstNumber: v.toUpperCase().slice(0, 15) })}
            placeholder="22AAAAA0000A1Z5"
            hint="15-character GSTIN. Speeds up verification."
          />
          <Field
            label="PAN number (optional)"
            value={form.panNumber}
            onChange={(v) => update({ panNumber: v.toUpperCase().slice(0, 10) })}
            placeholder="ABCDE1234F"
            hint="10-character business PAN."
          />
          <UploadCard
            title="Business registration / GST certificate"
            hint="Photo or PDF of the document"
            uploaded={!!form.businessDocUrl}
            uploading={uploading.doc}
            onClick={() => bizRef.current?.click()}
            icon={<FileText className="w-6 h-6" />}
          />
          <input
            ref={bizRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => upload('doc', e.target.files?.[0], 'businessDocUrl')}
            className="hidden"
          />
        </>
      ) : (
        <>
          <div>
            <label className="label">ID type <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {ID_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => update({ idType: t.key })}
                  className={`min-h-[48px] rounded-xl border-2 text-sm font-semibold transition px-3 ${form.idType === t.key
                    ? 'border-brand-orange bg-orange-50 text-brand-orange'
                    : 'border-slate-200 text-slate-700'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Field
            label="ID number"
            required
            value={form.idNumber}
            onChange={(v) => update({ idNumber: v.toUpperCase() })}
            placeholder={
              form.idType === 'aadhaar' ? 'XXXX XXXX XXXX'
                : form.idType === 'voter' ? 'ABC1234567'
                  : form.idType === 'dl' ? 'KA0120180001234'
                    : 'ABCDE1234F'
            }
            hint="Only used for verification. Never shared with workers."
          />

          <UploadCard
            title="Upload ID document"
            hint="Clear photo of the ID card"
            uploaded={!!form.idDocUrl}
            uploading={uploading.id}
            onClick={() => idRef.current?.click()}
            icon={<FileText className="w-6 h-6" />}
          />
          <input
            ref={idRef}
            type="file"
            accept="image/*"
            onChange={(e) => upload('id', e.target.files?.[0], 'idDocUrl')}
            className="hidden"
          />
        </>
      )}

      <UploadCard
        title="Selfie for face match"
        hint="Look straight at the camera in good light"
        uploaded={!!form.selfieUrl}
        uploading={uploading.selfie}
        onClick={() => selfieRef.current?.click()}
        icon={<Aperture className="w-6 h-6" />}
      />
      <input
        ref={selfieRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={(e) => upload('selfie', e.target.files?.[0], 'selfieUrl')}
        className="hidden"
      />

      {canSubmit && (
        <button
          onClick={submitVerification}
          className="btn-primary w-full !min-h-[56px] text-base"
        >
          <ShieldCheck className="w-5 h-5" />
          Submit for verification
        </button>
      )}

      <p className="text-xs text-slate-500 text-center">
        You can skip this and verify later from your profile.
      </p>
    </div>
  );
}

/*  STEP 5 — PAYMENT (shared)*/

function StepPayment({ form, update }) {
  const [mode, setMode] = useState(form.upiId ? 'upi' : 'bank');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-extrabold text-lg text-slate-900">How will you pay workers?</h2>
        <p className="text-sm text-slate-500 mt-1">
          You pay workers directly. ShramSetu just records the agreement.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
        {[{ k: 'upi', l: 'UPI (faster)' }, { k: 'bank', l: 'Bank account' }].map((m) => (
          <button
            key={m.k}
            type="button"
            onClick={() => setMode(m.k)}
            className={`min-h-[44px] rounded-lg text-sm font-bold transition ${mode === m.k ? 'bg-white shadow text-slate-900' : 'text-slate-600'
              }`}
          >
            {m.l}
          </button>
        ))}
      </div>

      {mode === 'upi' ? (
        <Field
          label="UPI ID"
          value={form.upiId}
          onChange={(v) => update({ upiId: v })}
          placeholder="name@upi"
          hint="e.g. quickmart@icici or 9876543210@ybl"
        />
      ) : (
        <>
          <Field
            label="Account number"
            value={form.bankAccount}
            onChange={(v) => update({ bankAccount: v.replace(/\D/g, '') })}
            placeholder="Account number"
          />
          <Field
            label="IFSC code"
            value={form.ifsc}
            onChange={(v) => update({ ifsc: v.toUpperCase().slice(0, 11) })}
            placeholder="HDFC0001234"
          />
        </>
      )}

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-900 flex items-start gap-3">
        <Lock className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-bold mb-1">Direct payment</p>
          <p className="text-xs leading-relaxed">
            You pay workers directly. ShramSetu never touches worker wages and takes zero commission.
          </p>
        </div>
      </div>
    </div>
  );
}

/* REUSABLE */

function Field({ label, value, onChange, placeholder, type = 'text', hint, required }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
      />
      {hint && <p className="text-[11px] text-slate-500 mt-1.5">{hint}</p>}
    </div>
  );
}

function UploadCard({ title, hint, uploaded, uploading, onClick, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={uploading}
      className={`w-full min-h-[72px] rounded-xl border-2 border-dashed flex items-center gap-3 px-4 py-3 text-left transition ${uploaded
        ? 'border-green-500 bg-green-50'
        : 'border-slate-300 bg-slate-50 hover:border-brand-orange hover:bg-orange-50'
        }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${uploaded ? 'bg-green-100 text-green-700' : 'bg-white text-slate-500'
        }`}>
        {uploading ? <Loader2 className="w-5 h-5 animate-spin" />
          : uploaded ? <Check className="w-5 h-5" />
            : icon || <Upload className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-slate-900">{title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {uploaded ? 'Uploaded ✓' : uploading ? 'Uploading…' : hint}
        </p>
      </div>
    </button>
  );
}