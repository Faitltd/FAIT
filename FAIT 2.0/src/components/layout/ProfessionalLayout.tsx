import React, { ReactNode } from 'react';
import ProfessionalHeader from './ProfessionalHeader';
import ProfessionalFooter from './ProfessionalFooter';

interface ProfessionalLayoutProps {
  children: ReactNode;
}

const ProfessionalLayout: React.FC<ProfessionalLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <ProfessionalHeader />
      <main className="flex-grow bg-neutral-50">
        {children}
      </main>
      <ProfessionalFooter />
    </div>
  );
};

export default ProfessionalLayout;
