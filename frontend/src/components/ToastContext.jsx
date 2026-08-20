import { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message, duration = 4000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    };

    const showSuccess = (msg) => addToast('success', msg);
    const showError = (msg) => addToast('error', msg);
    const showWarning = (msg) => addToast('warning', msg);
    const showInfo = (msg) => addToast('info', msg);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
            {children}
            <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full px-4">
                {toasts.map((toast) => {
                    const isSuccess = toast.type === 'success';
                    const isError = toast.type === 'error';
                    const isWarning = toast.type === 'warning';

                    const bg = isSuccess
                        ? 'bg-emerald-900 border-emerald-700 text-emerald-100'
                        : isError
                        ? 'bg-red-900 border-red-700 text-red-100'
                        : isWarning
                        ? 'bg-amber-900 border-amber-700 text-amber-100'
                        : 'bg-slate-900 border-slate-700 text-slate-100';

                    const Icon = isSuccess
                        ? CheckCircle2
                        : isError
                        ? XCircle
                        : isWarning
                        ? AlertTriangle
                        : Info;

                    return (
                        <div
                            key={toast.id}
                            className={`flex items-start justify-between p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-up ${bg}`}
                        >
                            <div className="flex items-center space-x-3">
                                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-medium leading-snug">{toast.message}</p>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="ml-4 opacity-70 hover:opacity-100 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        return {
            showSuccess: console.log,
            showError: console.error,
            showWarning: console.warn,
            showInfo: console.log,
        };
    }
    return context;
}
