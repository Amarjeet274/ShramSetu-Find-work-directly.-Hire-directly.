import { useEffect, useRef, useState } from 'react';
import { Mic, X, AlertCircle } from 'lucide-react';

const LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  bho: 'hi-IN',
};

export default function VoiceSearchModal({ open, lang = 'hi', onClose, onResult }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recRef = useRef(null);
  const finalRef = useRef('');

  useEffect(() => {
    if (!open) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('voice.notSupported'); return; }

    const rec = new SR();
    rec.lang = LANG_MAP[lang] || 'hi-IN';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => { setListening(true); setError(''); };
    rec.onerror = (e) => {
      const map = {
        'not-allowed': 'voice.micDenied',
        'service-not-allowed': 'voice.micDenied',
        'no-speech': 'voice.noSpeech',
        'audio-capture': 'voice.noMic',
        'network': 'voice.networkError',
        'aborted': null,
      };
      const key = map[e.error];
      if (key) setError(key);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      let interim = '';
      let final = finalRef.current;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const part = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += part;
        else interim += part;
      }
      finalRef.current = final;
      setTranscript((final + interim).trim());

      if (final.trim()) {
        setTimeout(() => {
          onResult?.(final.trim());
          stop();
        }, 700);
      }
    };

    recRef.current = rec;
    try { rec.start(); } catch { }

    return () => { try { rec.stop(); } catch { } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lang]);

  useEffect(() => {
    if (open) { setTranscript(''); setError(''); finalRef.current = ''; }
  }, [open]);

  const stop = () => {
    try { recRef.current?.stop(); } catch { }
    setListening(false);
  };

  const handleClose = () => { stop(); onClose?.(); };

  const handleRetry = () => {
    setError('');
    finalRef.current = '';
    setTranscript('');
    try { recRef.current?.start(); } catch { }
  };

  const handleUseText = () => {
    if (!transcript.trim()) return;
    onResult?.(transcript.trim());
    handleClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Voice search"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="w-full max-w-[320px] bg-white rounded-2xl shadow-2xl p-5 text-center animate-[fadeInUp_200ms_ease-out]">

        {/* Header — title + close */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Voice Search
          </p>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mic circle — 64px */}
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          {listening && (
            <>
              <span className="absolute inset-0 rounded-full bg-brand-orange/25 animate-ping" />
              <span className="absolute -inset-2 rounded-full bg-brand-orange/15 animate-ping [animation-delay:250ms]" />
            </>
          )}
          <button
            onClick={listening ? stop : handleRetry}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-md transition ${listening
              ? 'bg-brand-orange text-white scale-105'
              : 'bg-brand-navy text-white hover:bg-slate-800'
              }`}
            aria-label={listening ? 'Stop listening' : 'Start listening'}
          >
            {error === 'voice.notSupported' ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Status */}
        <p className="mt-3 text-sm font-bold text-slate-900">
          {listening ? 'Listening…' : error ? 'Try again' : 'Tap mic to speak'}
        </p>

        {/* Transcript / error / hint — compact, min-height keeps card stable */}
        <div className="mt-1.5 min-h-[44px] flex items-center justify-center px-1">
          {error ? (
            <p className="text-xs text-red-600 font-medium leading-snug">
              {error === 'voice.micDenied' && 'Microphone blocked. Allow access in settings.'}
              {error === 'voice.noSpeech' && 'Didn’t hear anything. Try again.'}
              {error === 'voice.noMic' && 'No microphone found.'}
              {error === 'voice.networkError' && 'Network error. Check connection.'}
              {error === 'voice.notSupported' && 'Voice search not supported. Use Chrome.'}
            </p>
          ) : transcript ? (
            <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              “{transcript}”
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Speak a job title, skill, or area —<br />
              e.g. <em>“plumber near me”</em> or <em>“delivery job”</em>
            </p>
          )}
        </div>

        {/* Actions — compact */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 min-h-[40px] rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUseText}
            disabled={!transcript.trim()}
            className="flex-1 min-h-[40px] rounded-lg bg-brand-orange hover:bg-brand-orangeDark text-white text-sm font-bold disabled:opacity-50 transition"
          >
            Search
          </button>
        </div>
        {/* Tip */}
        {!error && (
          <p className="mt-4 text-[11px] text-gray-500">
            <span className='text-yellow-500' >Tip: </span>speak clearly and close to the phone. We’ll search automatically.
          </p>
        )}
      </div>
    </div>
  );
}
