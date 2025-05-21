import React from 'react';
import CommonNavbar from './CommonNavbar';
import CommonFooter from './CommonFooter';
import MenuBar from './navigation/MenuBar';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPage = 'home' }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50">
        <CommonNavbar currentPage={currentPage} />
        <MenuBar />
      </header>
      <main className="flex-grow">
        {children}
      </main>
      <CommonFooter />
    </div>
  );
};

export default MainLayout;
