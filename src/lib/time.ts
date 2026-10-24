// Time utilities adhering to Section 2.5 Time Handling

let getTimeOffsetMs = (): number => 0;

export function registerTimeOffsetGetter(getter: () => number) {
  getTimeOffsetMs = getter;
}

export function now(): number {
  return Date.now() + getTimeOffsetMs();
}

export function formatTime(epochMs: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(epochMs));
}

export function formatDateTime(epochMs: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(epochMs));
}

export interface TimerStatus {
  isExpired: boolean;
  isWarning: boolean; // <= 30 minutes
  msLeft: number;
  text: string;
  badgeClass: string;
}

export function getTimerStatus(safeUntil: number, currentNow: number = now()): TimerStatus {
  const msLeft = safeUntil - currentNow;

  if (msLeft <= 0) {
    return {
      isExpired: true,
      isWarning: false,
      msLeft: 0,
      text: 'Expired',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
    };
  }

  const totalSec = Math.floor(msLeft / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  let text = '';
  if (hours > 0) {
    text = `${hours}h ${mins}m left`;
  } else if (mins > 0) {
    text = `${mins}m ${secs}s left`;
  } else {
    text = `${secs}s left`;
  }

  const isWarning = msLeft <= 30 * 60 * 1000; // 30 minutes

  return {
    isExpired: false,
    isWarning,
    msLeft,
    text,
    badgeClass: isWarning
      ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
  };
}
