import { Link, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
    const navigate = useNavigate();
    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#ecfdf5,_#f8fafc_45%,_#f1f5f9)] text-slate-800">
            <nav className="border-b border-white/40 bg-emerald-800/95 px-6 py-4 text-white shadow-lg backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="text-lg font-semibold">Wildlife Population Intelligence System</div>
                        <div className="text-sm text-emerald-100">Milestone 2 • AI detection, analytics, and reports</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Link className="rounded px-2 py-1 hover:bg-white/10" to="/">Dashboard</Link>
                        <Link className="rounded px-2 py-1 hover:bg-white/10" to="/species">Species</Link>
                        <Link className="rounded px-2 py-1 hover:bg-white/10" to="/audio">Audio</Link>
                        <Link className="rounded px-2 py-1 hover:bg-white/10" to="/biodiversity">Biodiversity</Link>
                        <Link className="rounded px-2 py-1 hover:bg-white/10" to="/reports">Reports</Link>
                        <Link className="rounded px-2 py-1 hover:bg-white/10" to="/datasets">Datasets</Link>
                        <button className="rounded bg-white/15 px-3 py-1 font-medium" type="button" onClick={logout}>Logout</button>
                    </div>
                </div>
            </nav>
            <main className="mx-auto max-w-7xl p-6 lg:p-8">{children}</main>
            <footer className="border-t border-slate-200 bg-white/70 px-6 py-4 text-sm text-slate-600">Milestone 2 • AI modules, analytics, and report generation</footer>
        </div>
    );
}
