import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Toast, { ToastProps } from './Toast';

export interface ToastOptions {
  type?: ToastProps['type'];
  title?: string;
  message: string;
  duration?: number;
}

// Create a unique ID for each toast
const generateId = () => `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Create a global event system for toasts
type ToastEvent = {
  type: 'add' | 'remove';
  toast?: ToastOptions;
  id?: string;
};

const toastEventTarget = new EventTarget();

// Function to add a toast from anywhere in the app
export const addToast = (options: ToastOptions) => {
  const event = new CustomEvent<ToastEvent>('toast', {
    detail: {
      type: 'add',
      toast: options,
    },
  });
  toastEventTarget.dispatchEvent(event);
};

// Helper functions for common toast types
export const showSuccess = (message: string, title?: string) => 
  addToast({ type: 'success', message, title });

export const showError = (message: string, title?: string) => 
  addToast({ type: 'error', message, title });

export const showInfo = (message: string, title?: string) => 
  addToast({ type: 'info', message, title });

export const showWarning = (message: string, title?: string) => 
  addToast({ type: 'warning', message, title });

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  // Create portal element on mount
  useEffect(() => {
    let element = document.getElementById('toast-container');
    if (!element) {
      element = document.createElement('div');
      element.id = 'toast-container';
      element.className = 'fixed top-4 right-4 z-50 flex flex-col space-y-4';
      document.body.appendChild(element);
    }
    setPortalElement(element);

    return () => {
      if (element && document.body.contains(element)) {
        document.body.removeChild(element);
      }
    };
  }, []);

  // Handle removing toasts
  const handleRemoveToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Listen for toast events
  useEffect(() => {
    const handleToastEvent = (event: Event) => {
      const customEvent = event as CustomEvent<ToastEvent>;
      const { type, toast, id } = customEvent.detail;

      if (type === 'add' && toast) {
        const newToast = {
          id: generateId(),
          type: toast.type || 'info',
          title: toast.title,
          message: toast.message,
          duration: toast.duration,
          onClose: handleRemoveToast,
        };
        setToasts((prevToasts) => [...prevToasts, newToast]);
      } else if (type === 'remove' && id) {
        handleRemoveToast(id);
      }
    };

    toastEventTarget.addEventListener('toast', handleToastEvent);
    return () => {
      toastEventTarget.removeEventListener('toast', handleToastEvent);
    };
  }, [handleRemoveToast]);

  if (!portalElement) return null;

  return createPortal(
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </>,
    portalElement
  );
};

export default ToastContainer;
