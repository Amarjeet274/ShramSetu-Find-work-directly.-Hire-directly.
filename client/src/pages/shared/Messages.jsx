import { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import { getSocket } from '../../hooks/useSocket';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function Messages() {
  const [convos, setConvos] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef();

  useEffect(() => {
    api.get('/messages/conversations').then(({ data }) => setConvos(data.conversations || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!active) return;
    api.get(`/messages/conversations/${active._id}/messages`).then(({ data }) => setMessages(data.messages || []));
    const s = getSocket();
    if (s) {
      s.emit('conversation:join', active._id);
      const handler = (msg) => { if (msg.conversation === active._id) setMessages((m) => [...m, msg]); };
      s.on('message:new', handler);
      return () => s.off('message:new', handler);
    }
  }, [active]);

  const send = () => {
    if (!text.trim() || !active) return;
    const s = getSocket();
    s?.emit('message:send', { conversationId: active._id, text }, () => setText(''));
  };

  if (loading) return <LoadingSpinner />;
  if (convos.length === 0) return <EmptyState title="No messages yet" description="Your conversations will appear here." />;

  return (
    <div className="grid md:grid-cols-3 gap-3 h-[70vh]">
      <aside className="card overflow-y-auto md:col-span-1">
        {convos.map((c) => (
          <button key={c._id} onClick={() => setActive(c)}
            className={`w-full text-left p-3 rounded-xl mb-1 ${active?._id === c._id ? 'bg-orange-50' : 'hover:bg-slate-50'}`}>
            <p className="font-bold text-sm">{c.participants?.filter(p => p._id !== active?._id).map(p => p.phone).join(', ')}</p>
            <p className="text-xs text-slate-500 truncate">{c.lastMessage || 'No messages yet'}</p>
          </button>
        ))}
      </aside>
      <section className="card md:col-span-2 flex flex-col">
        {active ? (
          <>
            <div ref={listRef} className="flex-1 overflow-y-auto space-y-2 mb-3">
              {messages.map((m) => (
                <div key={m._id} className={`max-w-[80%] px-4 py-2 rounded-2xl ${m.sender === active.participants?.[0]?._id ? 'bg-slate-100' : 'bg-brand-orange text-white ml-auto'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input flex-1" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message..." />
              <button className="btn-primary" onClick={send}>Send</button>
            </div>
          </>
        ) : (
          <p className="text-center text-slate-500 m-auto">Select a conversation</p>
        )}
      </section>
    </div>
  );
}