import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useMemo } from 'react';

export default function JobDetails() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try { const { data } = await api.get(`/jobs/${id}`); setJob(data.job); }
            catch { setError('Could not load job'); }
            finally { setLoading(false); }
        })();
    }, [id]);

    const [saved, setSaved] = useState(false);
    const toggleSave = async () => {
        const { data } = await api.post(`/workers/me/saved-jobs/${id}`);
        setSaved(data.saved);
    };
    // Button:
    <button aria-label="Save job" onClick={toggleSave} className="btn-ghost text-2xl">
        {saved ? '❤️' : '🤍'}
    </button>

    const apply = async () => {
        setApplying(true); setError('');
        try {
            await api.post(`/jobs/${id}/apply`, {});
            setApplied(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to apply');
        } finally { setApplying(false); }
    };

    if (loading) return <LoadingSpinner />;
    if (!job) return <div className="card text-center">{error || 'Not found'}</div>;

    // After job is loaded:
    const [lng, lat] = job.location?.coordinates || [];
    const mapUrl = useMemo(() => (
        lng && lat
            ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`
            : null
    ), [lng, lat]);

    {
        mapUrl && (
            <iframe
                title="Job location"
                src={mapUrl}
                className="w-full h-56 rounded-2xl border"
                loading="lazy"
            />
        )
    };

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            <button className="btn-ghost" onClick={() => navigate(-1)}>← Back</button>

            <div className="card">
                <h1 className="text-2xl font-extrabold">{job.title}</h1>
                <p className="text-slate-600 mt-1">{job.employer?.businessName}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {job.employer?.verification?.businessVerified && (
                        <StatusBadge status="verified" label={t('job.verifiedEmployer')} />
                    )}
                    <StatusBadge status="active" label={job.status} />
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-4">
                    <div><dt className="text-sm text-slate-500">{t('job.pay')}</dt><dd className="font-bold text-lg">₹{job.payRate}/{job.payType}</dd></div>
                    <div><dt className="text-sm text-slate-500">{t('job.shift')}</dt><dd className="font-bold">{job.schedule?.shift || 'flexible'}</dd></div>
                    <div><dt className="text-sm text-slate-500">{t('job.location')}</dt><dd className="font-bold">{job.address || '—'}</dd></div>
                    <div><dt className="text-sm text-slate-500">Category</dt><dd className="font-bold">{job.category}</dd></div>
                </dl>

                {job.description && (
                    <p className="mt-5 text-slate-700 whitespace-pre-wrap">{job.description}</p>
                )}
            </div>

            {error && <div className="card bg-red-50 border-red-200 text-red-800">{error}</div>}

            <button
                onClick={apply}
                disabled={applying || applied}
                className="btn-primary w-full text-lg !min-h-[64px]"
            >
                {applied ? `✓ ${t('job.applied')}` : applying ? t('common.loading') : t('job.apply')}
            </button>

            <button
                onClick={() => {/* TTS */ const utter = new SpeechSynthesisUtterance(`${job.title}, ₹${job.payRate} per ${job.payType}, at ${job.address}`); utter.lang = 'hi-IN'; speechSynthesis.speak(utter); }}
                className="btn-secondary w-full"
            >
                🔊 Suno (Listen)
            </button>
        </div>
    );

}