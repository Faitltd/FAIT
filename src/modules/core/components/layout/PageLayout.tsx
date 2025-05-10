import React from 'react';
import { cn } from '../../utils/cn';
import { Navigation } from './Navigation';

export interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  hideNavigation?: boolean;
}

/**
 * PageLayout component for consistent page structure
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  description,
  className,
  contentClassName,
  headerClassName,
  hideNavigation = false,
}) => {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {!hideNavigation && <Navigation />}

      {(title || description) && (
        <header className={cn('py-6 px-4 bg-white border-b border-gray-200', headerClassName)}>
          <div className="container mx-auto">
            {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
            {description && <p className="mt-2 text-gray-600">{description}</p>}
          </div>
        </header>
      )}

      <main className={cn('container mx-auto py-6 px-4', contentClassName)}>
        {children}
      </main>
    </div>
  );
};
