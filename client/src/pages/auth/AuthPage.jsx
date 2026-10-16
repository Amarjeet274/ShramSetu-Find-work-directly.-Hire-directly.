import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Zap } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') || 'worker');
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'worker' ? '/worker' : user.role === 'employer' ? '/employer' : '/admin');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const sendOtp = async (e) => {
    e.preventDefault(); setError('');
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Enter a valid 10-digit number');
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone });
      setStep('otp');
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verify = async (e) => {
    e.preventDefault(); setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', {
        phone, otp, role,
        language: localStorage.getItem('i18nextLng') || 'hi',
      });
      setUser(data.user);
      navigate(data.isNewUser ? '/auth/language' : (data.user.role === 'worker' ? '/worker' : data.user.role === 'employer' ? '/employer' : '/admin'));
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-md">


      {/*  DEV QUICK LOGIN (only visible during `vite dev`)*/}
      {/* baad me hata dena hai */}

      {import.meta.env.DEV && (
        <div className="w-full max-w-md mb-4 bg-amber-50 border-2 border-dashed border-amber-400 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-3 text-center">
            ⚡ Dev Mode — Instant Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'worker', label: 'Worker', emoji: '👷', cls: 'bg-orange-500 hover:bg-orange-600' },
              { role: 'employer', label: 'Employer', emoji: '🏢', cls: 'bg-blue-600 hover:bg-blue-700' },
              { role: 'admin', label: 'Admin', emoji: '🔑', cls: 'bg-purple-600 hover:bg-purple-700' },
            ].map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={async () => {
                  setError('');
                  setLoading(true);
                  try {
                    const { data } = await api.post('/auth/dev-login', { role: r.role });
                    setUser(data.user);
                    navigate(
                      r.role === 'worker' ? '/worker' :
                        r.role === 'employer' ? '/employer' :
                          '/admin'
                    );
                  } catch (err) {
                    setError(err.response?.data?.message || 'Dev login failed. Run: npm run seed:test');
                  } finally { setLoading(false); }
                }}
                className={`min-h-[52px] rounded-xl text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition ${r.cls}`}
              >
                <span className="text-lg">{r.emoji}</span>
                {r.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-amber-700 text-center mt-3">
            Bypasses OTP. Only visible with <code>npm run dev</code>.
          </p>
        </div>
      )}



      {/* Logo top */}
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-orange flex items-center justify-center text-white text-2xl shadow-lg">
          <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-4">Welcome back</h1>
        <p className="text-slate-500 text-sm mt-1">Sign in to your ShramSetu account</p>
      </div>

      {/* Role tabs */}
      <div className="mt-8 bg-slate-100 rounded-2xl p-1 grid grid-cols-3">
        {['worker', 'employer', 'admin'].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            type="button"
            className={`py-3 text-sm font-semibold rounded-xl transition ${role === r ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {r === 'worker' ? 'Worker' : r === 'employer' ? 'Employer' :'Admin'}
          </button>
        ))}
      </div>

      <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        {role === 'admin' ? (
          <AdminForm />
        ) : step === 'phone' ? (
          <form onSubmit={sendOtp}>
            <label className="block text-sm font-bold text-slate-800 mb-2">Mobile Number</label>
            <div className="flex">
              <span className="flex items-center px-4 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl font-semibold text-slate-700">+91</span>
              <input
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="input rounded-l-none"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">We'll send a one-time password to verify your number.</p>

            {error && <div role="alert" className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-4 !min-h-[52px]">
              {loading ? 'Sending…' : <>Send OTP <span aria-hidden="true">→</span></>}
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or continue with</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button type="button" className="w-full min-h-touch border border-slate-300 rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-50">
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 001 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
              </svg>
              Continue with Google
            </button>
          </form>
        ) : (
          <form onSubmit={verify}>
            <label className="block text-sm font-bold text-slate-800 mb-2">Enter 6-digit OTP</label>
            <p className="text-xs text-slate-500 mb-3">Sent to +91 {phone}</p>
            <input
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="input text-center tracking-[0.5em] text-2xl font-bold py-4"
            />
            {error && <div role="alert" className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</div>}
            <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full mt-4 !min-h-[52px]">
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </button>
            <div className="text-center text-xs text-slate-500 mt-3">
              {cooldown > 0 ? `Resend in ${cooldown}s` : (
                <button type="button" onClick={sendOtp} className="text-brand-orange font-semibold">Resend OTP</button>
              )}
            </div>
          </form>
        )}

        <p className="text-center text-sm text-slate-400 mt-6">
          First time? Just verify your mobile number — your account is created automatically.
        </p>

      </div>
      <div className="text-center mt-6">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">← Back to home</Link>
      </div>
    </div>
  );
}

function AdminForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); navigate('/admin'); }}
      className="space-y-4"
    >
      <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 text-purple-800 rounded-xl px-4 py-3 text-sm">
        <span className="text-lg shrink-0" aria-hidden="true">🔒</span>
        <p>Admin access is restricted to authorized ShramSetu staff. Sign in with your admin credentials.</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Admin Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@shramsetu.in" className="input" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="input" />
      </div>
      <button type="submit" className="btn-primary w-full !min-h-[52px]">
        Sign in as Admin <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}