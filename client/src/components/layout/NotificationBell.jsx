import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell, X, CheckCheck, Briefcase, MessageSquare, CreditCard,
  CheckCircle2, AlertCircle, Info,
} from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../hooks/useSocket';

const ICON_FOR_TYPE = {
  APPLICATION_NEW:        Briefcase,
  APPLICATION_STATUS:     Briefcase,
  HIRED:                  CheckCircle2,
  COMPLETION_REQUESTED:   Briefcase,
  COMPLETION_CONFIRMED:   CheckCircle2,
  PAYMENT_SUCCESS:        CreditCard,
  VERIFICATION_STATUS:    CheckCircle2,
  SUPPORT_REPLY:          MessageSquare,
  JOB_CANCELLED:          AlertCircle,
  default:                Info,
};

export default function NotificationBell({ role = 'worker' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  /* ── Fetch notifications when the panel opens ── */
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setItems(data.notifications || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  /* ── Listen for real-time notifications via socket ── */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (n) => setItems((prev) => [n, ...prev]);
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, []);

  /* ── Click outside + Escape ── */
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = async () => {
    const ids = items.filter((n) => !n.read).map((n) => n._id);
    if (!ids.length) return;
    try {
      await api.post('/notifications/read', { ids });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const openFullPage = () => {
    setOpen(false);
    navigate(`/${role}/notifications`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('nav.notifications', { defaultValue: 'Notifications' })}
        aria-expanded={open}
        className="relative w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-[fadeInUp_180ms_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {t('nav.notifications', { defaultValue: 'Notifications' })}
                </p>
                {unread > 0 && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {unread} {t('notif.unread', { defaultValue: 'unread' })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-brand-orange hover:text-brand-orangeDark flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-50"
                  >
                    <CheckCheck className="w-3 h-3" />
                    {t('notif.markAllRead', { defaultValue: 'Mark all read' })}
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="md:hidden w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  {t('common.loading', { defaultValue: 'Loading…' })}
                </div>
              ) : items.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-700 text-sm">
                    {t('notif.empty', { defaultValue: 'No notifications yet' })}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('notif.emptyHint', { defaultValue: 'We’ll notify you about applications, hires and payments.' })}
                  </p>
                </div>
              ) : (
                items.slice(0, 12).map((n) => {
                  const Icon = ICON_FOR_TYPE[n.type] || ICON_FOR_TYPE.default;
                  return (
                    <button
                      key={n._id}
                      onClick={() => {
                        setOpen(false);
                        if (n.data?.jobId) navigate(`/${role}/jobs/${n.data.jobId}`);
                        else if (n.data?.assignmentId) navigate(`/${role}/my-work`);
                        else if (n.data?.ticketId) navigate(`/${role}/support`);
                      }}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition ${
                        !n.read ? 'bg-orange-50/40' : ''
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        !n.read ? 'bg-brand-orange/15 text-brand-orange' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? 'font-bold' : 'font-medium'} text-slate-900 truncate`}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0 mt-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <button
                onClick={openFullPage}
                className="w-full py-3 text-sm font-bold text-brand-orange hover:bg-orange-50 border-t border-slate-100 transition"
              >
                {t('notif.viewAll', { defaultValue: 'View all notifications' })}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString();
}