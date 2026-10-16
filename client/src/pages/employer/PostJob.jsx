import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Loader2, CheckCircle2, AlertCircle, Navigation, RefreshCw,
} from 'lucide-react';
import api from '../../services/api';

const STEPS = ['Basic Info', 'Location', 'Requirements', 'Schedule', 'Pay'];
const CATEGORIES = [
  'Delivery', 'Driver', 'Construction', 'Domestic Help',
  'Plumber', 'Electrician', 'Warehouse', 'Security Guard', 'Cook', 'Other',
];
const SKILLS = [
  'Two-wheeler', 'Driving license', 'Customer service', 'GPS',
  'Kannada', 'Hindi', 'Physical strength', 'Own tools',
];
const SHIFTS = [
  { k: 'morning',   l: 'Morning (6–2)' },
  { k: 'afternoon', l: 'Afternoon (2–10)' },
  { k: 'night',     l: 'Night (10–6)' },
  { k: 'full_day',  l: 'Full Day' },
  { k: 'flexible',  l: 'Flexible' },
];

export default function PostJob() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | locating | geocoding | success | error

  const [form, setForm] = useState({
    title: '',
    category: 'Delivery',
    description: '',
    lng: null,
    lat: null,
    address: '',
    travelRadiusKm: 5,
    requiredSkills: [],
    minExperienceYears: 0,
    schedule: { startDate: '', shift: 'morning', workingDays: 'Mon-Fri' },
    payRate: '',
    payType: 'day',
    workersNeeded: 1,
    payFrequency: 'daily',
  });

  /* ══════════════════════════════════════════════════
     Auto-fetch location when entering the Location step
     ══════════════════════════════════════════════════ */
  useEffect(() => {
    if (step === 1 && !form.lng) {
      fetchCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setError('Location not supported on this device. Please type your area below.');
      return;
    }

    setLocationStatus('locating');
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((f) => ({ ...f, lat: latitude, lng: longitude }));
        setLocationStatus('geocoding');

        /* Reverse geocode using OSM Nominatim (free, no API key) */
        try {
          const url =
            `https://nominatim.openstreetmap.org/reverse?format=json` +
            `&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;
          const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
          if (!res.ok) throw new Error('geocode failed');
          const data = await res.json();
          const a = data.address || {};
          const short = [
            a.suburb || a.neighbourhood || a.village || a.hamlet,
            a.city || a.town || a.county || a.state_district,
          ].filter(Boolean).join(', ');
          if (short) setForm((f) => ({ ...f, address: short }));
          setLocationStatus('success');
        } catch {
          // Location captured but address not resolved — user can type it
          setLocationStatus('success');
        }
      },
      (err) => {
        setLocationStatus('error');
        const map = {
          1: 'Permission denied. Allow location access in your browser settings.',
          2: 'Position unavailable. Try again or type your area below.',
          3: 'Location request timed out. Try again or type your area below.',
        };
        setError(map[err.code] || err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  /* ══════════════════════════════════════════════════
     Client-side validation per step
     ══════════════════════════════════════════════════ */
  const validate = () => {
    const errs = {};

    if (step === 0) {
      if (!form.title || form.title.trim().length < 3)
        errs.title = 'Title must be at least 3 characters';
      if (!form.category) errs.category = 'Please pick a category';
      if (!form.description || form.description.trim().length < 10)
        errs.description = 'Description must be at least 10 characters';
    }

    if (step === 1) {
      if (!form.lng || !form.lat)
        errs.location = 'Location is required. Tap "Use my location" or type your area.';
      if (!form.address || form.address.trim().length < 3)
        errs.address = 'Area is required';
    }

    if (step === 4) {
      const rate = Number(form.payRate);
      if (!rate || rate < 1) errs.payRate = 'Enter a valid pay rate (min ₹1)';
      else if (rate > 1000000) errs.payRate = 'Pay rate is too high';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    setError('');
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setError('');
    setFieldErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  /* ══════════════════════════════════════════════════
     Submit
     ══════════════════════════════════════════════════ */
  const submit = async () => {
    setError('');
    // Validate the current (Pay) step
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);

    /* Build a clean payload with correct types */
    const payload = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      requiredSkills: form.requiredSkills,
      lng: Number(form.lng),
      lat: Number(form.lat),
      address: form.address.trim(),
      travelRadiusKm: Number(form.travelRadiusKm),
      minExperienceYears: Number(form.minExperienceYears),
      schedule: {
        startDate: form.schedule.startDate || undefined,
        shift: form.schedule.shift,
        workingDays: form.schedule.workingDays,
      },
      payRate: Number(form.payRate),
      payType: form.payType,
      workersNeeded: Number(form.workersNeeded),
    };

    try {
      const { data } = await api.post('/jobs', payload);
      navigate(`/employer/jobs/${data.job._id}/applicants`);
    } catch (err) {
      /* Extract the most useful error message */
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;

      let displayMsg = serverMsg || err.message || 'Failed to post job';

      if (status === 401) {
        displayMsg = 'Your session expired. Please sign in again.';
        setTimeout(() => navigate('/auth'), 1500);
      } else if (status === 403) {
        displayMsg = 'Permission denied. ' + (serverMsg || 'CSRF token missing — try refreshing the page.');
      } else if (status === 400 && validationErrors) {
        const fe = {};
        validationErrors.forEach((e) => { fe[e.param || e.path] = e.msg; });
        setFieldErrors(fe);
        displayMsg = validationErrors[0]?.msg || 'Please fix the highlighted fields.';
      }

      setError(displayMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  /* ══════════════════════════════════════════════════
     Render helpers
     ══════════════════════════════════════════════════ */
  const clearFieldError = (key) =>
    setFieldErrors((fe) => { const next = { ...fe }; delete next[key]; return next; });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => navigate('/employer')} className="hover:text-slate-800">
          ← Dashboard
        </button>
        <span>/</span>
        <span>Post Job</span>
      </div>

      <h1 className="text-2xl font-extrabold mt-2">Post a Job</h1>

      {/* Stepper */}
      <div className="mt-5 flex items-center gap-1 text-[11px] overflow-x-auto scrollbar-thin pb-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center shrink-0">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-white ${
                i < step ? 'bg-green-500' : i === step ? 'bg-brand-navy' : 'bg-slate-300'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </span>
            <span className={`ml-1.5 ${i === step ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && <span className="w-6 h-px bg-slate-300 mx-2" />}
          </div>
        ))}
      </div>

      {/* Global error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="card p-6 mt-5">
        {/* ════════ STEP 0 — BASIC ════════ */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <p className="font-extrabold text-lg">Basic Information</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Tell us about the job you need filled.
              </p>
            </div>

            <div>
              <label className="label">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => { setForm({ ...form, title: e.target.value }); clearFieldError('title'); }}
                placeholder="e.g. Delivery Rider, Plumber, Cook"
                className={`input ${fieldErrors.title ? 'border-red-400' : ''}`}
              />
              {fieldErrors.title && (
                <p className="text-xs text-red-600 mt-1.5">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <label className="label">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setForm({ ...form, category: c }); clearFieldError('category'); }}
                    className={`text-left text-sm border rounded-xl px-4 py-3 transition ${
                      form.category === c
                        ? 'border-brand-orange bg-orange-50 text-brand-orange font-semibold'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => { setForm({ ...form, description: e.target.value }); clearFieldError('description'); }}
                placeholder="What will the worker do? Hours, responsibilities, equipment needed?"
                className={`input min-h-[110px] py-3 ${fieldErrors.description ? 'border-red-400' : ''}`}
              />
              {fieldErrors.description && (
                <p className="text-xs text-red-600 mt-1.5">{fieldErrors.description}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">
                {form.description.length}/2000
              </p>
            </div>
          </div>
        )}

        {/* ════════ STEP 1 — LOCATION ════════ */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <p className="font-extrabold text-lg">Location</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Where will the work take place?
              </p>
            </div>

            {/* Auto-detected location card */}
            <div
              className={`rounded-xl border-2 p-4 transition ${
                locationStatus === 'success'
                  ? 'border-green-300 bg-green-50'
                  : locationStatus === 'error'
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    locationStatus === 'success'
                      ? 'bg-green-100 text-green-700'
                      : locationStatus === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-white text-slate-500'
                  }`}
                >
                  {locationStatus === 'locating' || locationStatus === 'geocoding' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : locationStatus === 'success' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : locationStatus === 'error' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <MapPin className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900">
                    {locationStatus === 'locating' && 'Finding your location…'}
                    {locationStatus === 'geocoding' && 'Getting your area…'}
                    {locationStatus === 'success' && 'Location captured'}
                    {locationStatus === 'error' && 'Could not detect location'}
                    {locationStatus === 'idle' && 'Location not set'}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 break-words">
                    {form.lat && form.lng
                      ? `${form.lat.toFixed(4)}, ${form.lng.toFixed(4)}`
                      : 'Tap the button below to use your current location'}
                  </p>

                  {locationStatus === 'success' && (
                    <button
                      type="button"
                      onClick={fetchCurrentLocation}
                      className="mt-2 text-xs font-bold text-brand-orange hover:text-brand-orangeDark flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Refresh location
                    </button>
                  )}
                </div>

                {locationStatus !== 'locating' && locationStatus !== 'geocoding' && (
                  <button
                    type="button"
                    onClick={fetchCurrentLocation}
                    className="shrink-0 bg-brand-orange hover:bg-brand-orangeDark text-white text-xs font-bold rounded-lg px-3 py-2 flex items-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Use my location
                  </button>
                )}
              </div>
            </div>

            {fieldErrors.location && (
              <p className="text-xs text-red-600">{fieldErrors.location}</p>
            )}

            {/* Manual address — editable in case reverse-geocode fails */}
            <div>
              <label className="label">
                Work Area <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin
                  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  strokeWidth={2}
                />
                <input
                  value={form.address}
                  onChange={(e) => { setForm({ ...form, address: e.target.value }); clearFieldError('address'); }}
                  placeholder="Neighbourhood, area, or city"
                  className={`input pl-11 ${fieldErrors.address ? 'border-red-400' : ''}`}
                />
              </div>
              {fieldErrors.address && (
                <p className="text-xs text-red-600 mt-1.5">{fieldErrors.address}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">
                Auto-filled from your GPS. Edit if needed.
              </p>
            </div>

            <div>
              <label className="label">Max Travel Radius for Worker</label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 5, 10, 20].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setForm({ ...form, travelRadiusKm: km })}
                    className={`text-sm border rounded-xl py-3 transition ${
                      form.travelRadiusKm === km
                        ? 'border-brand-orange bg-orange-50 text-brand-orange font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-sm text-blue-800">
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8h.01M11 12h1v4h1" />
              </svg>
              <p>
                The matching engine uses this radius as a mandatory constraint. Only workers
                within this distance from your work location will be matched.
              </p>
            </div>
          </div>
        )}

        {/* ════════ STEP 2 — REQUIREMENTS ════════ */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <p className="font-extrabold text-lg">Requirements</p>
              <p className="text-sm text-slate-500 mt-0.5">
                These become hard constraints in our matching engine — only candidates who
                meet them will be shown.
              </p>
            </div>

            <div>
              <label className="label">Required Skills</label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((s) => {
                  const on = form.requiredSkills.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          requiredSkills: on
                            ? form.requiredSkills.filter((x) => x !== s)
                            : [...form.requiredSkills, s],
                        })
                      }
                      className={`chip border-2 ${
                        on
                          ? 'border-brand-orange bg-orange-50 text-brand-orange'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="label">Minimum Experience</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { v: 0,   l: 'Any' },
                  { v: 0.5, l: '6 months' },
                  { v: 1,   l: '1 year' },
                  { v: 2,   l: '2 years' },
                  { v: 3,   l: '3+ years' },
                ].map((e) => (
                  <button
                    key={e.l}
                    type="button"
                    onClick={() => setForm({ ...form, minExperienceYears: e.v })}
                    className={`px-4 py-2 rounded-xl text-sm border ${
                      form.minExperienceYears === e.v
                        ? 'border-brand-orange bg-orange-50 text-brand-orange font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {e.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm text-amber-900">
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
              </svg>
              <p>
                <strong>Mandatory criteria:</strong> Requirements listed here eliminate
                ineligible candidates. Set only what is genuinely required — overly strict
                requirements reduce your match pool.
              </p>
            </div>
          </div>
        )}

        {/* ════════ STEP 3 — SCHEDULE ════════ */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <p className="font-extrabold text-lg">Schedule</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Workers who are not available for your schedule will be filtered out
                automatically.
              </p>
            </div>

            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={form.schedule.startDate}
                onChange={(e) =>
                  setForm({ ...form, schedule: { ...form.schedule, startDate: e.target.value } })
                }
                className="input"
              />
            </div>

            <div>
              <label className="label">Shift</label>
              <div className="flex flex-wrap gap-2">
                {SHIFTS.map((s) => (
                  <button
                    key={s.k}
                    type="button"
                    onClick={() => setForm({ ...form, schedule: { ...form.schedule, shift: s.k } })}
                    className={`px-4 py-2 rounded-xl text-sm border ${
                      form.schedule.shift === s.k
                        ? 'border-brand-orange bg-orange-50 text-brand-orange font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {s.l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {['Mon-Fri', 'Mon-Sat', 'All 7 days', 'Weekends', 'As needed'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, schedule: { ...form.schedule, workingDays: d } })
                    }
                    className={`px-4 py-2 rounded-xl text-sm border ${
                      form.schedule.workingDays === d
                        ? 'border-brand-orange bg-orange-50 text-brand-orange font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════ STEP 4 — PAY ════════ */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <p className="font-extrabold text-lg">Compensation</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Workers see pay before applying. Transparent pay attracts better candidates.
              </p>
            </div>

            <div>
              <label className="label">
                Pay Rate <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <div className="flex items-center px-4 border border-r-0 border-slate-300 rounded-l-xl bg-slate-50 font-semibold text-slate-700">
                  ₹
                </div>
                <input
                  type="number"
                  min="1"
                  value={form.payRate}
                  onChange={(e) => { setForm({ ...form, payRate: e.target.value }); clearFieldError('payRate'); }}
                  placeholder="Amount"
                  className={`input rounded-none ${fieldErrors.payRate ? 'border-red-400' : ''}`}
                />
                <div className="flex rounded-r-xl overflow-hidden border border-l-0 border-slate-300">
                  {['day', 'mo', 'job'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, payType: p === 'mo' ? 'month' : p })}
                      className={`px-4 text-sm font-semibold ${
                        (p === 'day' && form.payType === 'day') ||
                        (p === 'mo' && form.payType === 'month') ||
                        (p === 'job' && form.payType === 'job')
                          ? 'bg-brand-navy text-white'
                          : 'bg-white text-slate-600'
                      }`}
                    >
                      /{p}
                    </button>
                  ))}
                </div>
              </div>
              {fieldErrors.payRate && (
                <p className="text-xs text-red-600 mt-1.5">{fieldErrors.payRate}</p>
              )}
            </div>

            <div>
              <label className="label">Payment Frequency</label>
              <div className="flex flex-wrap gap-2">
                {['Daily', 'Weekly', 'Bi-weekly', 'Monthly'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setForm({ ...form, payFrequency: f.toLowerCase() })}
                    className={`px-4 py-2 rounded-xl text-sm border ${
                      form.payFrequency === f.toLowerCase()
                        ? 'border-brand-orange bg-orange-50 text-brand-orange font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 text-sm text-green-900">
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z" />
              </svg>
              <div>
                <p className="font-bold">Direct payment to worker</p>
                <p className="mt-1">
                  You pay the worker directly. ShramSetu does not take a commission from
                  worker wages. ShramSetu records the agreement for your protection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ════════ Navigation buttons ════════ */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex gap-2 flex-1">
            {step > 0 && (
              <button onClick={back} className="btn-secondary !min-h-[48px] px-6">
                Back
              </button>
            )}
          </div>
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn-primary !min-h-[48px] px-8">
              Continue <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={saving}
              className="btn-primary !min-h-[48px] px-8 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting…
                </>
              ) : (
                <>Post Job →</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Trust strip */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z" />
          </svg>
          Secure
        </span>
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-brand-orange" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 12h6M12 9v6" />
          </svg>
          Free to post
        </span>
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0" />
          </svg>
          2.4L+ workers
        </span>
      </div>
    </div>
  );
}