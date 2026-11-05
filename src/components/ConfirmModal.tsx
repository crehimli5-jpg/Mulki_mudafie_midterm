import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                : 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
            }`}
          >
            {isDestructive ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <HelpCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 id="confirm-dialog-title" className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all focus:outline-none focus-visible:ring-2 ${
              isDestructive
                ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 focus-visible:ring-amber-500 shadow-amber-600/20'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-500 shadow-blue-600/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
