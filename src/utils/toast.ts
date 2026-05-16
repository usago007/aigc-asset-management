import { toast } from 'sonner';
import type { ToastMessage } from '@/types';

export function showToast(
  type: ToastMessage['type'],
  message: string,
  duration: number = 3000
): string {
  const id = `toast-${Date.now()}-${Math.random()}`;
  
  switch (type) {
    case 'success':
      toast.success(message, { id, duration });
      break;
    case 'error':
      toast.error(message, { id, duration });
      break;
    case 'warning':
      toast.warning(message, { id, duration });
      break;
    case 'info':
      toast.info(message, { id, duration });
      break;
    default:
      toast(message, { id, duration });
  }
  
  return id;
}

export function removeToast(id: string): void {
  toast.dismiss(id);
}

export function getToasts(): ToastMessage[] {
  return [];
}

export function subscribeToToastUpdates(_listener: () => void): () => void {
  return () => {};
}
