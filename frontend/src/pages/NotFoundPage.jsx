import { Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-emerald-100 p-4 text-emerald-700">
                <AlertCircle className="w-12 h-12" />
            </div>
            <h1 className="mt-6 text-4xl font-extrabold text-slate-800 tracking-tight">404 - Page Not Found</h1>
            <p className="mt-3 max-w-md text-slate-600">
                The page or intelligence section you are looking for does not exist or has been moved.
            </p>
            <div className="mt-6 flex items-center space-x-4">
                <Link
                    to="/"
                    className="inline-flex items-center space-x-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 transition"
                >
                    <Home className="w-4 h-4" />
                    <span>Return to Dashboard</span>
                </Link>
            </div>
        </div>
    );
}
