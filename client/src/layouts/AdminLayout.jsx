import { Outlet, NavLink } from 'react-router-dom';
export default function AdminLayout() {
    const nav = [
        { to: '/admin', label: 'Dashboard', end: true },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/verifications', label: 'Verifications' },
        { to: '/admin/jobs', label: 'Jobs' },
        { to: '/admin/payments', label: 'Payments' },
        { to: '/admin/disputes', label: 'Disputes' },
        { to: '/admin/reports', label: 'Reports' },
        { to: '/admin/audit-logs', label: 'Audit Logs' },
    ];
    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-brand-navy text-white">
                <div className="max-w-7xl mx-auto px-4 py-3 font-bold">ShramSetu Admin</div>
            </header>
            <div className="max-w-7xl mx-auto flex">
                <aside className="w-56 bg-white min-h-screen border-r">
                    {nav.map((n) => (
                        <NavLink key={n.to} to={n.to} end={n.end}
                            className={({ isActive }) => `block px-4 py-3 font-medium border-l-4 ${isActive ? 'border-brand-orange bg-orange-50 text-brand-orange' : 'border-transparent text-slate-700 hover:bg-slate-50'}`}>
                            {n.label}
                        </NavLink>
                    ))}
                </aside>
                <main className="flex-1 p-6"><Outlet /></main>
            </div>
        </div>
    );
}