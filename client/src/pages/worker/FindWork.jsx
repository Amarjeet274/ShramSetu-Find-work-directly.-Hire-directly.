import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mic } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import VoiceSearchModal from '../../components/VoiceSearchModal';

const CATEGORIES = [
  'Delivery', 'Construction', 'Domestic Help', 'Driver',
  'Warehouse', 'Plumber', 'Electrician', 'Cook', 'Security',
];

export default function FindWork() {
  const { t, i18n } = useTranslation();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const navigate = useNavigate();

  const langCode = (i18n.resolvedLanguage || i18n.language || 'hi').split('-')[0];

  const load = async (override = {}) => {
    setLoading(true);
    try {
      const params = {};
      const query = override.q !== undefined ? override.q : q;
      const cat   = override.category !== undefined ? override.category : category;
      if (query) params.q = query;
      if (cat) params.category = cat;

      // Ask browser for location
      if (navigator.geolocation) {
        await new Promise((res) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => { params.lat = pos.coords.latitude; params.lng = pos.coords.longitude; res(); },
            () => res(),
            { timeout: 4000 }
          );
        });
      }

      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [category]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{t('worker.findWork')}</h1>

      {/* ── Search row ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            className="input pl-12"
            placeholder={t('worker.searchPlaceholder')}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true">🔍</span>
        </div>

        {/* Mic button — opens VoiceSearchModal */}
        <button
          type="button"
          onClick={() => setVoiceOpen(true)}
          aria-label="Voice search"
          className="min-w-touch min-h-touch rounded-xl border-2 border-slate-300 bg-white text-slate-600 hover:border-brand-orange hover:text-brand-orange flex items-center justify-center transition-colors"
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>

      {/* ── Category chips ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory('')}
          className={`chip border-2 whitespace-nowrap ${
            !category ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white border-slate-300'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`chip border-2 whitespace-nowrap ${
              category === c ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white border-slate-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Results ── */}
      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="Try a different category or area."
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <article key={j._id} className="card">
              <h3 className="font-extrabold text-lg">{j.title}</h3>
              <p className="text-slate-600 text-sm">{j.employer?.businessName}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                <span>💵 ₹{j.payRate}/{j.payType}</span>
                {j.address && <span>📍 {j.address}</span>}
                <span>🕐 {j.schedule?.shift || 'flexible'}</span>
              </div>
              <button
                className="btn-primary w-full mt-3"
                onClick={() => navigate(`/worker/jobs/${j._id}`)}
              >
                {t('worker.applyNow')}
              </button>
            </article>
          ))}
        </div>
      )}

      {/* ── Voice Search Modal ── */}
      <VoiceSearchModal
        open={voiceOpen}
        lang={langCode}
        onClose={() => setVoiceOpen(false)}
        onResult={(text) => {
          setQ(text);
          setVoiceOpen(false);
          // Trigger the search with the newly transcribed text
          load({ q: text });
        }}
      />
    </div>
  );
}