import React, { createContext, useContext, useEffect } from 'react';

interface A11yContextType {
  announceMessage: (message: string) => void;
}

const A11yContext = createContext<A11yContextType | null>(null);

export const A11yProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.prepend(skipLink);

    // Monitor focus management
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, []);

  const announceMessage = (message: string) => {
    const announcer = document.getElementById('a11y-announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  };

  return (
    <A11yContext.Provider value={{ announceMessage }}>
      {children}
      <div
        id="a11y-announcer"
        role="alert"
        aria-live="polite"
        className="sr-only"
      />
    </A11yContext.Provider>
  );
};