export interface ToastMessage {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

type ToastListener = (toasts: ToastMessage[]) => void;

let toasts: ToastMessage[] = [];
const listeners: Set<ToastListener> = new Set();

function emit() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function subscribeToasts(listener: ToastListener): () => void {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}

export function showToast(message: string, type: 'error' | 'success' | 'info' = 'info') {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, message, type }];
  emit();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 3500);
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}
