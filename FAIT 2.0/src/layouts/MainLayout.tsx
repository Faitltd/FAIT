import React, { ReactNode } from 'react';
import Navbar from '../components/navigation/Navbar';
import DynamicFooter from '../components/animations/DynamicFooter';

interface MainLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  transparentHeader?: boolean;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  hideFooter = false,
  transparentHeader = false,
  className = '',
}) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Navbar transparent={transparentHeader} />
      
      <main className="flex-grow">
        {children}
      </main>
      
      {!hideFooter && <DynamicFooter />}
    </div>
  );
};

export default MainLayout;
