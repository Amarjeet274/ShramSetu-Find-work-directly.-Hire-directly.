import { useEffect, useState } from 'react';
import api from '../../services/api';

const CATEGORIES = ['Payment', 'Account', 'Verification', 'Job', 'Employer', 'Worker', 'Technical problem', 'Safety', 'Other'];

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ category: 'Payment', subject: '', description: '' });
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/support/tickets')
      .then(({ data }) => {
        const list = data.tickets || [];
        setTickets(list);
        if (!active && list[0]) setActive(list[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!active) return;
    api.get(`/support/tickets/${active._id}/messages`)
      .then(({ data }) => setMessages(data.messages || active.messages || []))
      .catch(() => setMessages(active.messages || []));
  }, [active]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/support/tickets', form);
      setCreating(false);
      setForm({ category: 'Payment', subject: '', description: '' });
      load();
    } catch {}
  };

  const send = async () => {
    if (!text.trim() || !active) return;
    await api.post(`/support/tickets/${active._id}/messages`, { text });
    setMessages((m) => [...m, { sender: { _id: 'me' }, text, createdAt: new Date() }]);
    setText('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden grid md:grid-cols-[320px,1fr] min-h-[70vh]">
      {/* Sidebar */}
      <aside className="border-r border-slate-200 bg-slate-50">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-extrabold">Support</h2>
          <button className="text-xs text-slate-500 hover:text-slate-800">← Dashboard</button>
        </div>
        <div className="p-3">
          <button
            onClick={() => setCreating(true)}
            className="w-full btn-primary !min-h-[44px] text-sm"
          >
            + New Issue
          </button>
        </div>
        <div className="px-3 pb-3 space-y-1">
          {tickets.map((t) => (
            <button
              key={t._id}
              onClick={() => setActive(t)}
              className={`w-full text-left rounded-xl p-3 transition ${
                active?._id === t._id ? 'bg-white border border-slate-200 shadow-sm' : 'hover:bg-white/60'
              }`}
            >
              <p className="text-sm font-bold truncate text-slate-900">{t.subject || t.category}</p>
              <p className="text-xs text-slate-500 truncate mt-1">{t.description || t.messages?.[0]?.text}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`chip text-[10px] ${
                  t.status === 'RESOLVED' ? 'bg-green-50 text-green-700' :
                  t.status === 'CLOSED' ? 'bg-slate-100 text-slate-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {t.status === 'RESOLVED' ? '✓ Resolved' : 'Active'}
                </span>
                <span className="text-[10px] text-slate-400">2h ago</span>
              </div>
            </button>
          ))}
          {tickets.length === 0 && !loading && (
            <p className="text-xs text-slate-500 text-center py-6">No tickets yet</p>
          )}
        </div>
      </aside>

      {/* Thread */}
      <section className="flex flex-col min-h-0">
        {creating ? (
          <form onSubmit={submit} className="p-6 space-y-4">
            <h3 className="font-extrabold text-lg">New Issue</h3>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subject</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="label">Describe the problem</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[120px] py-3" required />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setCreating(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Submit</button>
            </div>
          </form>
        ) : active ? (
          <>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900">{active.subject}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="chip bg-blue-50 text-blue-700">● Active</span>
                  <span>Opened 2h ago</span>
                </div>
              </div>
              <button className="border border-slate-300 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                Close Issue
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {messages.map((m, i) => {
                const isMe = m.sender?._id === 'me' || m.sender?._id === active.user?._id || i % 2 === 0;
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center mr-2 shrink-0">
                        SS
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                      isMe ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-800'
                    }`}>
                      <p>{m.text}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                        {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {isMe && (
                      <div className="w-8 h-8 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center ml-2 shrink-0">
                        RK
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <button className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 hover:underline">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.4 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                  Upload Photo / Proof
                </button>
                <span className="text-xs text-slate-500">Attach shift confirmation or receipt for payment disputes</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <p className="text-4xl mb-2">💬</p>
              <p className="font-bold text-slate-700">Your messages</p>
              <p className="text-sm mt-1">All conversations are linked to job applications.</p>
              <p className="text-xs mt-0.5">Worker contact information is protected.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}