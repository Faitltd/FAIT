import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  timeout?: number;
  dismissible?: boolean;
}

const createNotificationStore = () => {
  const { subscribe, update } = writable<Notification[]>([]);

  return {
    subscribe,
    add: (notification: Omit<Notification, 'id'>) => {
      const id = uuidv4();
      const defaults = {
        timeout: 5000,
        dismissible: true
      };
      
      update(notifications => [
        ...notifications,
        { ...defaults, ...notification, id }
      ]);
      
      // Auto-dismiss if timeout is set
      if (notification.timeout !== 0) {
        setTimeout(() => {
          update(notifications => notifications.filter(n => n.id !== id));
        }, notification.timeout || defaults.timeout);
      }
      
      return id;
    },
    remove: (id: string) => {
      update(notifications => notifications.filter(n => n.id !== id));
    },
    success: (message: string, title?: string, timeout?: number) => {
      return this.add({ type: 'success', message, title, timeout });
    },
    error: (message: string, title?: string, timeout?: number) => {
      return this.add({ type: 'error', message, title, timeout });
    },
    info: (message: string, title?: string, timeout?: number) => {
      return this.add({ type: 'info', message, title, timeout });
    },
    warning: (message: string, title?: string, timeout?: number) => {
      return this.add({ type: 'warning', message, title, timeout });
    },
    clear: () => {
      update(() => []);
    }
  };
};

export const notifications = createNotificationStore();
