import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGS = [
  { value: 'en', label: 'English', native: 'English', flag: '🇬🇧', short: 'EN' },
  { value: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳', short: 'HI' },
  { value: 'bho', label: 'Bhojpuri', native: 'भोजपुरी', flag: '🇮🇳', short: 'BH' },
];

export default function LanguageSwitcher({ dark = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const code = (i18n.resolvedLanguage || i18n.language || 'hi').split('-')[0];
  const current = LANGS.find((l) => l.value === code) || LANGS[0];

  const change = (val) => {
    i18n.changeLanguage(val);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button — matches Nav.jsx style */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`list-none flex items-center gap-2 border rounded-xl px-3 min-h-[40px] cursor-pointer select-none transition-all duration-150 outline-none ${dark
            ? 'bg-white/15 hover:bg-white/25 border-white/30 hover:border-white/50 text-white'
            : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-slate-400 text-slate-800'
          }`}
      >
        <Globe className="w-3.5 h-3.5 shrink-0" />
        <span className="text-base leading-none" aria-hidden="true">{current.flag}</span>
        <span className="text-xs font-bold tracking-widest uppercase">{current.short}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown — matches Nav.jsx style */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-[#d6d3d3e2] border border-white/12 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden z-[9999] py-1.5">
          <div className="px-3 pt-1.5 pb-2 border-b border-black/80">
            <p className="text-[10px] font-semibold text-black/80 uppercase tracking-widest">
              Language · भाषा
            </p>
          </div>
          {LANGS.map((o) => {
            const active = code === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => change(o.value)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm transition-colors duration-100 ${active ? 'bg-black/30' : 'hover:bg-black/[0.18]'
                  }`}
              >
                <span className="text-lg leading-none shrink-0">{o.flag}</span>
                <span className="flex flex-col items-start min-w-0">
                  <span className={`text-xs font-bold leading-tight ${active ? 'text-brand-orange' : 'text-black/90'}`}>
                    {o.native}
                  </span>
                  <span className="text-[10px] text-blue-500 leading-tight">{o.label}</span>
                </span>
                {active && (
                  <span className="ml-auto w-4 h-4 rounded-full bg-brand-orange flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}