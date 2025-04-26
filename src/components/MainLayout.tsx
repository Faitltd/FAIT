import React from 'react';
import CommonNavbar from './CommonNavbar';
import CommonFooter from './CommonFooter';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage = 'home' }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <CommonNavbar currentPage={currentPage} />
      <main className="flex-grow">
        {children}
      </main>
      <CommonFooter />
    </div>
  );
};

export default MainLayout;
