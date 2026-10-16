import { useState } from 'react';

export default function VoiceSearchButton({ onResult, lang = 'hi-IN', small = false }) {
  const [listening, setListening] = useState(false);

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice not supported'); return; }
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => onResult?.(e.results[0][0].transcript);
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
  };

  if (small) {
    return (
      <button
        type="button"
        onClick={start}
        aria-label="Voice search"
        className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
          listening ? 'bg-red-100 text-red-600' : 'text-slate-500 hover:text-brand-orange'
        }`}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 19v3M8 22h8M12 15a4 4 0 004-4V6a4 4 0 00-8 0v5a4 4 0 004 4z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      aria-label="Voice search"
      className={`min-w-touch min-h-touch rounded-xl flex items-center justify-center border-2 transition ${
        listening
          ? 'bg-red-50 border-red-400 text-red-600'
          : 'bg-white border-slate-300 text-slate-600 hover:border-brand-orange'
      }`}
    >
      <span aria-hidden="true" className="text-xl">🎤</span>
    </button>
  );
}