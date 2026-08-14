import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({
  message,
  type = 'success',
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900',
    info: 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-900',
    error: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900'
  };

  const textColors = {
    success: 'text-emerald-800 dark:text-emerald-300',
    info: 'text-blue-800 dark:text-blue-300',
    error: 'text-rose-800 dark:text-rose-300'
  };

  const currentThemeClass = bgColors[type] || bgColors.success;
  const currentTextClass = textColors[type] || textColors.success;

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-xl border shadow-lg max-w-sm transition-all duration-300 animate-slide-in backdrop-blur-sm ${currentThemeClass}`}>
      <div className="flex items-center gap-3 w-full">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : type === 'info' ? (
          <Info className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
        ) : (
          <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
        )}
        <span className={`text-sm font-medium pr-4 ${currentTextClass}`}>{message}</span>
        
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-auto focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default Toast;
