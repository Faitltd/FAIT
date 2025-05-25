import { writable } from 'svelte/store';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const toasts = writable<Toast[]>([]);

export function showToast(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9);
  const newToast: Toast = { ...toast, id };
  
  toasts.update(current => [...current, newToast]);
  
  if (toast.duration !== 0) {
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  }
}

export function showSuccess(title: string, message?: string) {
  showToast({ type: 'success', title, message });
}

export function showError(title: string, message?: string) {
  showToast({ type: 'error', title, message });
}

export function showWarning(title: string, message?: string) {
  showToast({ type: 'warning', title, message });
}

export function showInfo(title: string, message?: string) {
  showToast({ type: 'info', title, message });
}

export function removeToast(id: string) {
  toasts.update(current => current.filter(toast => toast.id !== id));
}
