import { generateUUID } from './uuid';
import type { ToastMessage } from '@/types';

const toasts: ToastMessage[] = [];
let listeners: (() => void)[] = [];

export function showToast(
  type: ToastMessage['type'],
  message: string,
  duration: number = 3000
): string {
  const id = generateUUID();
  toasts.push({ id, type, message, duration });
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
  return id;
}

export function removeToast(id: string): void {
  const index = toasts.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    notifyListeners();
  }
}

export function getToasts(): ToastMessage[] {
  return [...toasts];
}

export function subscribeToToastUpdates(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function notifyListeners(): void {
  listeners.forEach(listener => listener());
}
