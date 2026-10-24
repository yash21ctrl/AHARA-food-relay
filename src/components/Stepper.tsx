import React from 'react';
import { OrderStatus } from '../types';
import { Check, XCircle, AlertCircle } from 'lucide-react';

interface StepperProps {
  status: OrderStatus;
}

const STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'ACCEPTED', label: 'Accepted', desc: 'Food locked' },
  { status: 'CONFIRMED', label: 'Confirmed', desc: 'Method agreed' },
  { status: 'READY', label: 'Ready', desc: 'Vehicle assigned' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'In transit' },
  { status: 'DELIVERED', label: 'Delivered', desc: 'Received & safe' }
];

export const Stepper: React.FC<StepperProps> = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3 text-rose-800">
        <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
        <div>
          <div className="font-semibold text-sm">Order Cancelled</div>
          <div className="text-xs text-rose-600">The surplus food was returned to the post and made available to other organizations.</div>
        </div>
      </div>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex items-center gap-3 text-slate-700">
        <AlertCircle className="w-6 h-6 text-slate-500 shrink-0" />
        <div>
          <div className="font-semibold text-sm">Order Expired</div>
          <div className="text-xs text-slate-500">The safe consumption window passed before delivery was completed.</div>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="w-full py-2">
      <div className="grid grid-cols-5 relative">
        {/* Connecting line behind steps */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-emerald-600 transition-all duration-300 -z-0"
          style={{
            width: `${Math.min(100, (Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100)}%`
          }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex || status === 'DELIVERED';
          const isCurrent = idx === currentStepIndex && status !== 'DELIVERED';

          return (
            <div key={step.status} className="flex flex-col items-center relative z-10 text-center px-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200 ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-white border-2 border-emerald-600 text-emerald-700 font-bold ring-4 ring-emerald-100 animate-pulse'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <div
                className={`mt-2 text-xs font-semibold leading-tight ${
                  isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {step.label}
              </div>
              <div className="hidden sm:block text-[10px] text-slate-500 mt-0.5">
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
