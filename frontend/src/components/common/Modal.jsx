import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  // Prevent scrolling behind modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Container */}
      <div
        className={`bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-800 rounded-xl shadow-xl w-full max-w-lg p-6 relative z-10 transform transition-all max-h-[90vh] overflow-y-auto ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-forest-800 pb-3 mb-4">
          <h3 className="text-lg font-semibold font-outfit text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};
export default Modal;
