import { useState } from 'react';
import api from '../services/api';
import Button from './ui/Button';

export default function ReviewModal({ assignmentId, targetLabel, onClose, onDone }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true); setError('');
    try {
      await api.post('/reviews', { assignmentId, rating, feedback });
      onDone?.(); onClose?.();
    } catch (e) { setError(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 space-y-4">
        <h3 className="text-lg font-extrabold">Rate {targetLabel}</h3>
        <div className="flex justify-center gap-1 text-4xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}
              aria-label={`${n} stars`}
              className={n <= rating ? 'text-amber-400' : 'text-slate-300'}>
              ★
            </button>
          ))}
        </div>
        <textarea className="input min-h-[100px] py-3"
          placeholder="Optional feedback…"
          value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        {error && <div className="text-red-700 text-sm">{error}</div>}
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}