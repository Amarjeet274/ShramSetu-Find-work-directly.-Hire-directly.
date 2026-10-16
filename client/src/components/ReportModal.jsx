import { useState } from 'react';
import api from '../services/api';
import Button from './ui/Button';

const REASONS = [
  'Fake employer', 'Fraud', 'Payment issue', 'Unsafe job', 'Harassment',
  'Misconduct', 'Fake worker', 'No-show', 'Fake job', 'Other',
];

export default function ReportModal({ targetType, targetId, onClose }) {
  const [reason, setReason] = useState('Fraud');
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await api.post('/reports', { targetType, targetId, reason, details });
      setDone(true);
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-5 space-y-4">
        {done ? (
          <>
            <p className="text-lg font-extrabold text-green-700">✓ Reported</p>
            <p className="text-sm text-slate-600">Our team will review within 24 hours.</p>
            <Button className="w-full" onClick={onClose}>Close</Button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-extrabold">Report</h3>
            <div>
              <label className="label">Reason</label>
              <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
                {REASONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <textarea className="input min-h-[100px] py-3"
              placeholder="Describe what happened…"
              value={details} onChange={(e) => setDetails(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" onClick={submit} disabled={saving}>
                {saving ? 'Sending…' : 'Submit report'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}