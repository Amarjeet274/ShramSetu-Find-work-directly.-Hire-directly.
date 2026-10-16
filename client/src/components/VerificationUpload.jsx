import { useState } from 'react';
import api from '../services/api';
import Button from './ui/Button';

export default function VerificationUpload({ role }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!file) return;
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/uploads/single', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const endpoint = role === 'worker' ? '/workers/me/verification' : '/employers/me/verification';
      await api.post(endpoint, {
        documentKey: data.file.key,
        documentUrl: data.file.url,
      });
      setDone(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  if (done) {
    return (
      <div className="card bg-green-50 border-green-200 text-green-800">
        ✓ Submitted. Our team will verify within 24 hours.
      </div>
    );
  }

  return (
    <div className="card space-y-3">
      <p className="font-bold">Identity verification</p>
      <p className="text-sm text-slate-600">
        Upload a clear photo of your Aadhaar / Voter ID / Driving License (front side).
      </p>
      <input
        type="file" accept="image/*,application/pdf"
        className="input py-3"
        onChange={(e) => setFile(e.target.files?.[0])}
      />
      {error && <div role="alert" className="text-red-700 text-sm">{error}</div>}
      <Button onClick={submit} disabled={!file || uploading} className="w-full">
        {uploading ? 'Uploading…' : 'Submit for verification'}
      </Button>
    </div>
  );
}