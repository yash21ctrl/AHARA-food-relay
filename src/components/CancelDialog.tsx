import React, { useState } from 'react';
import { Role } from '../types';
import { AlertTriangle, X } from 'lucide-react';

interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  userRole: Role;
  qty: number;
}

export const CancelDialog: React.FC<CancelDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userRole,
  qty
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 3) {
      setError('Please provide a specific reason (minimum 3 characters)');
      return;
    }
    setError('');
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-base">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Cancel Order ({qty} plates)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-sm text-slate-600">
            Cancelling this order as <strong className="capitalize text-slate-900">{userRole}</strong> will release the{' '}
            <strong>{qty} plates</strong> immediately back into the public feed so other community organizations can claim it before it expires.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Cancellation <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                userRole === 'donor'
                  ? 'e.g. Food spoilage noticed, venue emergency, or delivery unfeasible...'
                  : 'e.g. Transport breakdown, unable to find driver, or meals already covered...'
              }
              rows={3}
              className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              autoFocus
            />
            {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Nevermind
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm transition-colors"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
