import { useAppStore } from '../store';
import { User } from '../types';

export function useCurrentUser(): {
  currentUser: User | undefined;
  currentUserId: string | null;
  isDonor: boolean;
  isReceiver: boolean;
} {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const users = useAppStore((s) => s.users);

  const currentUser = users.find((u) => u.id === currentUserId);
  const isDonor = currentUser?.role === 'donor';
  const isReceiver = currentUser?.role === 'receiver';

  return {
    currentUser,
    currentUserId,
    isDonor,
    isReceiver
  };
}
