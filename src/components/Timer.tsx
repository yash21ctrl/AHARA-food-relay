import React from 'react';
import { useNow } from '../hooks/useNow';
import { getTimerStatus } from '../lib/time';
import { AlertTriangle, Clock } from 'lucide-react';

interface TimerProps {
  safeUntil: number;
  className?: string;
  showIcon?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  safeUntil,
  className = '',
  showIcon = true
}) => {
  const currentNow = useNow();
  const status = getTimerStatus(safeUntil, currentNow);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${status.badgeClass} ${className}`}
      title={`Safe until: ${new Date(safeUntil).toLocaleTimeString()}`}
    >
      {showIcon && (
        status.isWarning ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
        ) : (
          <Clock className="w-3.5 h-3.5 shrink-0" />
        )
      )}
      <span>{status.text}</span>
      {status.isWarning && !status.isExpired && (
        <span className="hidden sm:inline text-[10px] font-normal tracking-tight">
          (Expires soon!)
        </span>
      )}
    </div>
  );
};
