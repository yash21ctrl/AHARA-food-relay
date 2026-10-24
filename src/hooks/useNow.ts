import { useEffect, useState } from 'react';
import { now } from '../lib/time';

/**
 * Hook that returns the current simulated timestamp and forces a component re-render every second.
 */
export function useNow(): number {
  const [currentNow, setCurrentNow] = useState<number>(now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNow(now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return currentNow;
}
