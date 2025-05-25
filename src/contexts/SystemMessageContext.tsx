import React, { createContext, useState, useContext, ReactNode } from 'react';
import SystemMessagePopup from '../components/SystemMessagePopup';

type MessageType = 'success' | 'error' | 'info' | 'warning';

interface SystemMessage {
  id: string;
  text: string;
  type: MessageType;
}

interface SystemMessageContextType {
  showMessage: (text: string, type?: MessageType) => void;
  hideMessage: (id: string) => void;
}

const SystemMessageContext = createContext<SystemMessageContextType | undefined>(undefined);

export const useSystemMessage = () => {
  const context = useContext(SystemMessageContext);
  if (!context) {
    throw new Error('useSystemMessage must be used within a SystemMessageProvider');
  }
  return context;
};

interface SystemMessageProviderProps {
  children: ReactNode;
}

export const SystemMessageProvider: React.FC<SystemMessageProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<SystemMessage[]>([]);

  const showMessage = (text: string, type: MessageType = 'info') => {
    const id = Date.now().toString();
    setMessages(prev => [...prev, { id, text, type }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      hideMessage(id);
    }, 5000);
    
    return id;
  };

  const hideMessage = (id: string) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  };

  return (
    <SystemMessageContext.Provider value={{ showMessage, hideMessage }}>
      {children}
      {messages.map(message => (
        <SystemMessagePopup
          key={message.id}
          message={message.text}
          type={message.type}
          isOpen={true}
          onClose={() => hideMessage(message.id)}
        />
      ))}
    </SystemMessageContext.Provider>
  );
};

export default SystemMessageProvider;
