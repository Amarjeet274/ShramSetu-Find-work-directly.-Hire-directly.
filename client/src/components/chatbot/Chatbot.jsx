import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import VoiceSearchButton from '../ui/VoiceSearchButton';
import { speak } from '../../hooks/useVoice';

export default function Chatbot() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ? / How can I help you?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { messages: [...messages, userMsg] });
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
      speak(data.reply, i18n.language === 'en' ? 'en-IN' : 'hi-IN');
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <button
        aria-label="Open assistant"
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 md:bottom-6 right-5 z-40 w-16 h-16 rounded-full bg-brand-orange text-white shadow-lg text-3xl"
      >
        🤖
      </button>

      {open && (
        <div className="fixed bottom-24 md:bottom-24 right-5 z-50 w-[92vw] max-w-sm bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col h-[520px]">
          <header className="bg-brand-navy text-white p-4 flex items-center justify-between">
            <div>
              <p className="font-bold">ShramSetu Assistant</p>
              <p className="text-xs text-slate-300">Ask me anything</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </header>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${m.role === 'user' ? 'bg-brand-orange text-white ml-auto' : 'bg-slate-100'}`}>
                {m.content}
              </div>
            ))}
            {loading && <div className="text-xs text-slate-500">Typing…</div>}
          </div>
          <div className="p-3 border-t flex gap-2 items-center">
            <input
              className="input flex-1"
              placeholder="Type or speak…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
            />
            <VoiceSearchButton onResult={(text) => send(text)} />
            <button className="btn-primary !px-4" onClick={() => send(input)} disabled={loading}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}