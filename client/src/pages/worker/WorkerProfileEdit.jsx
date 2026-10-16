import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    User, Briefcase, MapPin, Languages, ShieldCheck, Wallet,
    ChevronLeft, ChevronRight, Check, Camera, Upload, X,
    AlertCircle, CheckCircle2, Loader2, Aperture, Lock,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

/* ──────────────────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────────────────── */

const STEPS = [
    { key: 'basic', icon: User, labelKey: 'profile.step1' },
    { key: 'skills', icon: Briefcase, labelKey: 'profile.step2' },
    { key: 'location', icon: MapPin, labelKey: 'profile.step3' },
    { key: 'languages', icon: Languages, labelKey: 'profile.step4' },
    { key: 'verify', icon: ShieldCheck, labelKey: 'profile.step5' },
    { key: 'payment', icon: Wallet, labelKey: 'profile.step6' },
];

const SKILL_CATEGORIES = [
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

const LANGUAGES = [
    { code: 'hi', label: 'हिंदी' },
    { code: 'en', label: 'English' },
    { code: 'bho', label: 'भोजपुरी' },
    { code: 'mr', label: 'मराठी' },
    { code: 'gu', label: 'ગુજરાતી' }
];

const AVAILABILITY = [
    { key: 'morning', label: 'Morning (6–2)' },
    { key: 'afternoon', label: 'Afternoon (2–10)' },
    { key: 'night', label: 'Night (10–6)' },
    { key: 'full_day', label: 'Full day' },
    { key: 'flexible', label: 'Flexible' },
];

/*PAGE */
export default function WorkerProfileEdit() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuthStore();

    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState({
        fullName: '',
        dob: '',
        gender: '',
        photoUrl: '',
        skills: [],
        experienceYears: 0,
        address: '',
        lng: null,
        lat: null,
        travelRadiusKm: 5,
        availability: 'flexible',
        languages: ['hi'],
        aadhaarNumber: '',
        aadhaarName: '',
        aadhaarDocUrl: '',
        selfieUrl: '',
        bankAccount: '',
        ifsc: '',
        upiId: '',
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    /* Load existing profile */
    useEffect(() => {
        api.get('/workers/me')
            .then(({ data }) => {
                if (data.profile) {
                    setProfile((p) => ({ ...p, ...data.profile }));
                }
            })
            .catch(() => { });
    }, []);

    const update = (patch) => setProfile((p) => ({ ...p, ...patch }));

    /* Save current step to backend */
    const saveStep = async () => {
        setSaving(true);
        setError('');
        try {
            await api.patch('/workers/me', {
                fullName: profile.fullName,
                dob: profile.dob,
                gender: profile.gender,
                photoUrl: profile.photoUrl,
                skills: profile.skills,
                experienceYears: profile.experienceYears,
                address: profile.address,
                lng: profile.lng,
                lat: profile.lat,
                travelRadiusKm: profile.travelRadiusKm,
                availability: profile.availability,
                languages: profile.languages,
            });
            setSuccess(t('profile.saved', { defaultValue: 'Saved' }));
            setTimeout(() => setSuccess(''), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const next = async () => {
        await saveStep();
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const back = () => setStep((s) => Math.max(0, s - 1));

    const finish = async () => {
        await saveStep();
        navigate('/worker/profile');
    };

    /* ── Compute profile strength ── */
    const strength = (() => {
        let s = 0;
        if (profile.fullName) s += 15;
        if (profile.photoUrl) s += 10;
        if (profile.skills?.length) s += 10;
        if (profile.experienceYears > 0) s += 5;
        if (profile.address) s += 10;
        if (profile.languages?.length >= 2) s += 5;
        if (profile.aadhaarNumber && profile.selfieUrl) s += 30;
        if (profile.bankAccount || profile.upiId) s += 15;
        return Math.min(100, s);
    })();

    return (
        <div className="max-w-2xl mx-auto pb-24">
            {/* ── Header ── */}
            <div className="flex items-center gap-3 mb-4">
                <button onClick={() => navigate('/worker/profile')} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-extrabold text-slate-900">
                        {t('profile.completeYourProfile', { defaultValue: 'Complete your profile' })}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {t('profile.stepOf', { step: step + 1, total: STEPS.length, defaultValue: `Step ${step + 1} of ${STEPS.length}` })}
                    </p>
                </div>
            </div>

            {/* ── Progress bar + strength ── */}
            <div className="card p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">
                        {t('worker.profileStrength', { defaultValue: 'Profile strength' })}
                    </span>
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

            {/* ── Stepper pills ── */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-thin">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const done = i < step;
                    const active = i === step;
                    return (
                        <button
                            key={s.key}
                            onClick={() => i <= step && setStep(i)}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition ${active
                                    ? 'bg-brand-orange text-white'
                                    : done
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                        >
                            {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                            <span className="whitespace-nowrap">{t(s.labelKey, { defaultValue: `Step ${i + 1}` })}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Step body ── */}
            <div className="card p-5">
                {step === 0 && <StepBasic profile={profile} update={update} />}
                {step === 1 && <StepSkills profile={profile} update={update} />}
                {step === 2 && <StepLocation profile={profile} update={update} />}
                {step === 3 && <StepLanguages profile={profile} update={update} />}
                {step === 4 && <StepVerify profile={profile} update={update} />}
                {step === 5 && <StepPayment profile={profile} update={update} />}
            </div>

            {/* ── Feedback ── */}
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

            {/* ── Nav buttons —  at bottom ── */}
            <div className="bottom-0 m-0.5 rounded-xl left-0 right-0 bg-white border-t border-slate-200 p-4 flex items-center gap-2 z-30">
                <div className="max-w-2xl mx-auto w-full flex items-center gap-2 ">
                    {step > 0 && (
                        <button onClick={back} className="btn-secondary !min-h-[48px] px-5">
                            <ChevronLeft className="w-4 h-4" /> {t('common.back', { defaultValue: 'Back' })}
                        </button>
                    )}
                    {step < STEPS.length - 1 ? (
                        <button onClick={next} disabled={saving} className="btn-primary flex-1 !min-h-[48px]">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {t('common.next', { defaultValue: 'Next' })} <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button onClick={finish} disabled={saving} className="btn-primary flex-1 !min-h-[48px]">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {t('profile.finish', { defaultValue: 'Save profile' })}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/*STEP 1 — BASIC INFO */
function StepBasic({ profile, update }) {
    const { t } = useTranslation();
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
        } catch {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="font-extrabold text-lg text-slate-900">
                    {t('profile.basicTitle', { defaultValue: 'Tell us who you are' })}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    {t('profile.basicSub', { defaultValue: 'Your real name. Employers will see this.' })}
                </p>
            </div>

            {/* Photo upload — big and obvious */}
            <div className="flex flex-col items-center">
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="relative w-28 h-28 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 hover:border-brand-orange flex items-center justify-center overflow-hidden transition"
                >
                    {profile.photoUrl ? (
                        <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : uploading ? (
                        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                    ) : (
                        <div className="text-center">
                            <Camera className="w-7 h-7 text-slate-400 mx-auto" />
                            <span className="text-[10px] text-slate-500 mt-1 block">
                                {t('profile.addPhoto', { defaultValue: 'Add photo' })}
                            </span>
                        </div>
                    )}
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={upload}
                    className="hidden"
                />
                <p className="text-[11px] text-slate-500 mt-2 text-center">
                    {t('profile.photoHint', { defaultValue: 'Face photo — helps employers recognise you' })}
                </p>
            </div>

            <Field
                label={t('profile.fullName', { defaultValue: 'Full name' })}
                required
                value={profile.fullName}
                onChange={(v) => update({ fullName: v })}
                placeholder={t('profile.fullNamePlaceholder', { defaultValue: 'e.g. Ramesh Kumar' })}
                hint={t('profile.fullNameHint', { defaultValue: 'As written on your Aadhaar card' })}
            />

            <Field
                label={t('profile.dob', { defaultValue: 'Date of birth' })}
                type="date"
                value={profile.dob?.slice(0, 10) || ''}
                onChange={(v) => update({ dob: v })}
                hint={t('profile.dobHint', { defaultValue: 'Helps match you with age-appropriate jobs' })}
            />

            <div>
                <label className="label">
                    {t('profile.gender', { defaultValue: 'Gender' })}
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { k: 'male', l: t('profile.male', { defaultValue: 'Male' }) },
                        { k: 'female', l: t('profile.female', { defaultValue: 'Female' }) },
                        { k: 'other', l: t('profile.other', { defaultValue: 'Other' }) },
                    ].map((g) => (
                        <button
                            key={g.k}
                            type="button"
                            onClick={() => update({ gender: g.k })}
                            className={`min-h-[48px] rounded-xl border-2 text-sm font-semibold transition ${profile.gender === g.k
                                    ? 'border-brand-orange bg-orange-50 text-brand-orange'
                                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            {g.l}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* STEP 2 — SKILLS */
function StepSkills({ profile, update }) {
    const { t } = useTranslation();

    const toggle = (key) => {
        const on = profile.skills?.includes(key);
        update({ skills: on ? profile.skills.filter((s) => s !== key) : [...(profile.skills || []), key] });
    };

    const years = [0.5, 1, 2, 3, 5, 10];

    return (
        <div className="space-y-5">
            <div>
                <h2 className="font-extrabold text-lg text-slate-900">
                    {t('profile.skillsTitle', { defaultValue: 'What work can you do?' })}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    {t('profile.skillsSub', { defaultValue: 'Pick all that apply. More skills = more jobs.' })}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SKILL_CATEGORIES.map((s) => {
                    const on = profile.skills?.includes(s.key);
                    return (
                        <button
                            key={s.key}
                            type="button"
                            onClick={() => toggle(s.key)}
                            className={`min-h-[56px] rounded-xl border-2 text-sm font-semibold flex items-center justify-center gap-2 transition px-3 ${on
                                    ? 'border-brand-orange bg-orange-50 text-brand-orange'
                                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            {on && <Check className="w-4 h-4" />}
                            <span>{t(`categories.${s.key}`, { defaultValue: s.label })}</span>
                        </button>
                    );
                })}
            </div>

            <div>
                <label className="label">
                    {t('profile.experienceYears', { defaultValue: 'Experience' })}
                </label>
                <div className="flex flex-wrap gap-2">
                    {years.map((y) => (
                        <button
                            key={y}
                            type="button"
                            onClick={() => update({ experienceYears: y })}
                            className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition ${profile.experienceYears === y
                                    ? 'border-brand-orange bg-orange-50 text-brand-orange'
                                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            {y < 1 ? '6 months' : `${y}+ years`}
                        </button>
                    ))}
                </div>
            </div>

            {profile.skills?.length >= 2 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>Multiple skills increase your chance of getting matched by 3×.</p>
                </div>
            )}
        </div>
    );
}

/*STEP 3 — LOCATION */
function StepLocation({ profile, update }) {
    const { t } = useTranslation();
    const [detecting, setDetecting] = useState(false);
    const [gpsError, setGpsError] = useState('');

    const detect = () => {
        if (!navigator.geolocation) {
            setGpsError('Location not supported');
            return;
        }
        setDetecting(true);
        setGpsError('');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                update({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setDetecting(false);
            },
            (err) => {
                setGpsError(err.message || 'Could not get location');
                setDetecting(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="font-extrabold text-lg text-slate-900">
                    {t('profile.locationTitle', { defaultValue: 'Where do you work?' })}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    {t('profile.locationSub', { defaultValue: 'We show you jobs near this area.' })}
                </p>
            </div>

            {/* GPS capture — prominent button */}
            <button
                type="button"
                onClick={detect}
                disabled={detecting}
                className={`w-full min-h-[56px] rounded-xl border-2 font-semibold flex items-center justify-center gap-2 transition ${profile.lat
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-brand-orange bg-orange-50 text-brand-orange hover:bg-orange-100'
                    }`}
            >
                {detecting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : profile.lat ? (
                    <CheckCircle2 className="w-5 h-5" />
                ) : (
                    <MapPin className="w-5 h-5" />
                )}
                {detecting
                    ? t('profile.detecting', { defaultValue: 'Finding your location…' })
                    : profile.lat
                        ? t('profile.locationCaptured', { defaultValue: 'Location captured ✓' })
                        : t('profile.useMyLocation', { defaultValue: 'Use my current location' })}
            </button>

            {gpsError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                    {gpsError}. Please type your area below.
                </div>
            )}

            <Field
                label={t('profile.address', { defaultValue: 'Your area / locality' })}
                value={profile.address}
                onChange={(v) => update({ address: v })}
                placeholder={t('profile.addressPlaceholder', { defaultValue: 'e.g. Koramangala, Bengaluru' })}
                hint={t('profile.addressHint', { defaultValue: 'Type your neighbourhood — employers will see this' })}
            />

            <div>
                <label className="label">
                    {t('profile.travelRadius', { defaultValue: 'How far can you travel for work?' })}
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {[2, 5, 10, 20].map((km) => (
                        <button
                            key={km}
                            type="button"
                            onClick={() => update({ travelRadiusKm: km })}
                            className={`min-h-[48px] rounded-xl border-2 text-sm font-semibold transition ${profile.travelRadiusKm === km
                                    ? 'border-brand-orange bg-orange-50 text-brand-orange'
                                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            {km} km
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="label">
                    {t('profile.availability', { defaultValue: 'When can you work?' })}
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {AVAILABILITY.map((a) => (
                        <button
                            key={a.key}
                            type="button"
                            onClick={() => update({ availability: a.key })}
                            className={`min-h-[48px] rounded-xl border-2 text-sm font-semibold transition px-3 ${profile.availability === a.key
                                    ? 'border-brand-orange bg-orange-50 text-brand-orange'
                                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            {t(`profile.avail_${a.key}`, { defaultValue: a.label })}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* STEP 4 — LANGUAGES */
function StepLanguages({ profile, update }) {
    const { t } = useTranslation();

    const toggle = (code) => {
        const on = profile.languages?.includes(code);
        const next = on
            ? profile.languages.filter((l) => l !== code)
            : [...(profile.languages || []), code];
        if (next.length === 0) return; // always keep at least one
        update({ languages: next });
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="font-extrabold text-lg text-slate-900">
                    {t('profile.langsTitle', { defaultValue: 'Which languages do you speak?' })}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    {t('profile.langsSub', { defaultValue: 'Pick all you can speak. Employers search by language.' })}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((l) => {
                    const on = profile.languages?.includes(l.code);
                    return (
                        <button
                            key={l.code}
                            type="button"
                            onClick={() => toggle(l.code)}
                            className={`min-h-[52px] rounded-xl border-2 text-sm font-semibold transition flex items-center justify-center gap-2 ${on
                                    ? 'border-brand-orange bg-orange-50 text-brand-orange'
                                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                        >
                            {on && <Check className="w-4 h-4" />}
                            {l.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/*STEP 5 — VERIFICATION (the*/
function StepVerify({ profile, update }) {
    const { t } = useTranslation();
    const aadhaarRef = useRef(null);
    const selfieRef = useRef(null);
    const [uploading, setUploading] = useState({ aadhaar: false, selfie: false });
    const [nameMatches, setNameMatches] = useState(null);

    const upload = async (kind, file) => {
        if (!file) return;
        setUploading((u) => ({ ...u, [kind]: true }));
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await api.post('/uploads/single', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (kind === 'aadhaar') update({ aadhaarDocUrl: data.file.url });
            else {
                update({ selfieUrl: data.file.url });
                // Compare selfie to profile photo — backend could run face verification later
                if (profile.aadhaarName && profile.fullName) {
                    const a = profile.aadhaarName.trim().toLowerCase();
                    const b = profile.fullName.trim().toLowerCase();
                    setNameMatches(a === b);
                }
            }
        } catch {
            alert('Upload failed');
        } finally {
            setUploading((u) => ({ ...u, [kind]: false }));
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-orange" />
                    {t('profile.verifyTitle', { defaultValue: 'Verify your identity' })}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    {t('profile.verifySub', { defaultValue: 'Verified workers get 3× more jobs and appear first in employer searches.' })}
                </p>
            </div>

            {/* Why we ask */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 flex items-start gap-3">
                <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                    <p className="font-bold mb-1">{t('profile.verifyWhy', { defaultValue: 'Why we verify?' })}</p>
                    <p className="text-xs leading-relaxed">
                        {t('profile.verifyWhyBody', { defaultValue: 'Verification keeps fake profiles and middlemen out. It protects real workers and real employers. Your documents are stored encrypted and never shared with anyone.' })}
                    </p>
                </div>
            </div>

            {/* Aadhaar name */}
            <Field
                label={t('profile.aadhaarName', { defaultValue: 'Name on your Aadhaar' })}
                required
                value={profile.aadhaarName}
                onChange={(v) => update({ aadhaarName: v })}
                placeholder={t('profile.aadhaarNamePlaceholder', { defaultValue: 'As printed on the card' })}
                hint={t('profile.aadhaarNameHint', { defaultValue: 'Must match the name in your profile above' })}
            />

            {/* Aadhaar number */}
            <Field
                label={t('profile.aadhaarNumber', { defaultValue: 'Aadhaar number' })}
                value={profile.aadhaarNumber}
                onChange={(v) => update({ aadhaarNumber: v.replace(/\D/g, '').slice(0, 12) })}
                placeholder="XXXX XXXX XXXX"
                hint={t('profile.aadhaarNumberHint', { defaultValue: '12 digits. Only used for verification.' })}
                secure
            />

            {/* Aadhaar document upload */}
            <UploadCard
                title={t('profile.aadhaarDoc', { defaultValue: 'Aadhaar card photo' })}
                hint={t('profile.aadhaarDocHint', { defaultValue: 'Front side. Blur-sensitive info if you prefer.' })}
                uploaded={!!profile.aadhaarDocUrl}
                uploading={uploading.aadhaar}
                onClick={() => aadhaarRef.current?.click()}
            />
            <input
                ref={aadhaarRef}
                type="file"
                accept="image/*"
                onChange={(e) => upload('aadhaar', e.target.files?.[0])}
                className="hidden"
            />

            {/* Selfie */}
            <UploadCard
                title={t('profile.selfie', { defaultValue: 'A selfie for face match' })}
                hint={t('profile.selfieHint', { defaultValue: 'Look straight at the camera in good light' })}
                uploaded={!!profile.selfieUrl}
                uploading={uploading.selfie}
                onClick={() => selfieRef.current?.click()}
                icon={<Aperture className="w-6 h-6" />}
            />
            <input
                ref={selfieRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => upload('selfie', e.target.files?.[0])}
                className="hidden"
            />

            {nameMatches === true && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Names match. Ready for verification.
                </div>
            )}
            {nameMatches === false && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                        Names on your profile and Aadhaar don't match. Please correct one of them.
                    </span>
                </div>
            )}

            {/* Submit for review */}
            {profile.aadhaarDocUrl && profile.selfieUrl && nameMatches && (
                <button
                    onClick={async () => {
                        try {
                            await api.post('/workers/me/verification', {
                                documentUrl: profile.aadhaarDocUrl,
                                selfieUrl: profile.selfieUrl,
                                aadhaarNumber: profile.aadhaarNumber,
                                aadhaarName: profile.aadhaarName,
                            });
                            alert('✓ Submitted for verification. Our team will review within 24 hours.');
                        } catch (e) {
                            alert(e.response?.data?.message || 'Submission failed');
                        }
                    }}
                    className="btn-primary w-full !min-h-[56px] text-base"
                >
                    <ShieldCheck className="w-5 h-5" />
                    {t('profile.submitVerification', { defaultValue: 'Submit for verification' })}
                </button>
            )}

            <p className="text-xs text-slate-500 text-center">
                {t('profile.skipVerify', { defaultValue: 'You can skip this step and verify later from your profile.' })}
            </p>
        </div>
    );
}

/*STEP 6 — PAYMENT*/
function StepPayment({ profile, update }) {
    const { t } = useTranslation();
    const [mode, setMode] = useState(profile.upiId ? 'upi' : 'bank');

    return (
        <div className="space-y-5">
            <div>
                <h2 className="font-extrabold text-lg text-slate-900">
                    {t('profile.paymentTitle', { defaultValue: 'How should we pay you?' })}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    {t('profile.paymentSub', { defaultValue: 'Employers pay you directly. We just record the agreement.' })}
                </p>
            </div>

            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                {[
                    { k: 'upi', l: t('profile.upi', { defaultValue: 'UPI (faster)' }) },
                    { k: 'bank', l: t('profile.bank', { defaultValue: 'Bank account' }) },
                ].map((m) => (
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
                    label={t('profile.upiId', { defaultValue: 'Your UPI ID' })}
                    value={profile.upiId}
                    onChange={(v) => update({ upiId: v })}
                    placeholder="name@upi"
                    hint={t('profile.upiHint', { defaultValue: 'e.g. ramesh@paytm or 9876543210@ybl' })}
                />
            ) : (
                <>
                    <Field
                        label={t('profile.bankAccount', { defaultValue: 'Account number' })}
                        value={profile.bankAccount}
                        onChange={(v) => update({ bankAccount: v.replace(/\D/g, '') })}
                        placeholder="Account number"
                    />
                    <Field
                        label={t('profile.ifsc', { defaultValue: 'IFSC code' })}
                        value={profile.ifsc}
                        onChange={(v) => update({ ifsc: v.toUpperCase().slice(0, 11) })}
                        placeholder="HDFC0001234"
                        hint={t('profile.ifscHint', { defaultValue: 'Printed on your passbook or cheque' })}
                    />
                </>
            )}

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-900 flex items-start gap-3">
                <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                    <p className="font-bold mb-1">{t('profile.directPayment', { defaultValue: 'Direct payment to you' })}</p>
                    <p className="text-xs leading-relaxed">
                        {t('profile.directPaymentBody', { defaultValue: 'ShramSetu never touches your money. Employers pay you directly. Zero commission from your wages.' })}
                    </p>
                </div>
            </div>
        </div>
    );
}

/*REUSABLE FIELD */
function Field({ label, value, onChange, placeholder, type = 'text', hint, required, secure }) {
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
                className={`input ${secure ? 'font-mono tracking-wider' : ''}`}
                required={required}
            />
            {hint && <p className="text-[11px] text-slate-500 mt-1.5">{hint}</p>}
        </div>
    );
}

/*REUSABLE UPLOAD CARD */
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
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : uploaded ? <Check className="w-5 h-5" /> : (icon || <Upload className="w-5 h-5" />)}
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