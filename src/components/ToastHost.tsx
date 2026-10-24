import React, { useEffect, useState } from 'react';
import { dismissToast, subscribeToasts, ToastMessage } from '../lib/toast';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const ToastHost: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToasts(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-lg border transition-all transform animate-in slide-in-from-bottom-5 duration-200 ${
              isError
                ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-rose-100'
                : isSuccess
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-emerald-100'
                : 'bg-slate-900 border-slate-700 text-white shadow-slate-900/20'
            }`}
          >
            {isError && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {!isError && !isSuccess && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
