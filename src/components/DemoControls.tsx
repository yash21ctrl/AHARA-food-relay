import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useNow } from '../hooks/useNow';
import { formatTime } from '../lib/time';
import { showToast } from '../lib/toast';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

export const DemoControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const timeOffsetMs = useAppStore((s) => s.timeOffsetMs);
  const addTimeOffset = useAppStore((s) => s.addTimeOffset);
  const resetTimeOffset = useAppStore((s) => s.resetTimeOffset);

  const currentTime = useNow();
  const offsetMinutes = Math.round(timeOffsetMs / 60000);

  const handleFastForward = (minutes: number) => {
    addTimeOffset(minutes * 60 * 1000);
    showToast(`Time shifted by +${minutes} minutes`, 'info');
  };

  const handleResetTime = () => {
    resetTimeOffset();
    showToast('Reset clock to real time', 'info');
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white shadow-lg border border-slate-700 backdrop-blur-md text-xs font-medium hover:bg-slate-800 transition-all"
          title="Click to open time simulation controls"
        >
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Clock: {formatTime(currentTime)}</span>
          {offsetMinutes !== 0 && (
            <span className="text-amber-400 font-bold">
              ({offsetMinutes > 0 ? `+${offsetMinutes}m` : `${offsetMinutes}m`})
            </span>
          )}
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
        </button>
      ) : (
        <div className="bg-slate-900/95 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-md text-xs space-y-2 max-w-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulated Clock</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-slate-300">
            Current: <strong className="text-white font-mono">{formatTime(currentTime)}</strong>
            {offsetMinutes !== 0 && (
              <span className="text-amber-400 ml-1">({offsetMinutes > 0 ? `+${offsetMinutes}m` : `${offsetMinutes}m`})</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">
              Advance:
            </span>
            <button
              onClick={() => handleFastForward(15)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 border border-slate-700"
            >
              +15m
            </button>
            <button
              onClick={() => handleFastForward(30)}
              className="px-2 py-0.5 bg-amber-950 hover:bg-amber-900 text-amber-300 font-bold rounded border border-amber-800"
              title="Test 30-min food safety warning"
            >
              +30m (Warning)
            </button>
            <button
              onClick={() => handleFastForward(180)}
              className="px-2 py-0.5 bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold rounded border border-rose-800"
              title="Test safe-until expiry"
            >
              +3h (Expiry)
            </button>
            {offsetMinutes !== 0 && (
              <button
                onClick={handleResetTime}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded border border-slate-700 text-[10px]"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
