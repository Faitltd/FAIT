import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast, ToastOptions } from 'react-toastify';

interface SystemMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: Date;
}

interface SystemMessageContextType {
  messages: SystemMessage[];
  addMessage: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, options?: ToastOptions) => void;
}

const SystemMessageContext = createContext<SystemMessageContextType | undefined>(undefined);

const SystemMessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<SystemMessage[]>([]);

  const addMessage = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const newMessage: SystemMessage = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prevMessages) => prevMessages.filter((message) => message.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const showToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string, options?: ToastOptions) => {
    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'info':
        toast.info(message, options);
        break;
      case 'warning':
        toast.warning(message, options);
        break;
      default:
        toast(message, options);
    }
  }, []);

  const value = {
    messages,
    addMessage,
    removeMessage,
    clearMessages,
    showToast,
  };

  return <SystemMessageContext.Provider value={value}>{children}</SystemMessageContext.Provider>;
};

export const useSystemMessage = () => {
  const context = useContext(SystemMessageContext);
  if (context === undefined) {
    throw new Error('useSystemMessage must be used within a SystemMessageProvider');
  }
  return context;
};

export default SystemMessageProvider;
