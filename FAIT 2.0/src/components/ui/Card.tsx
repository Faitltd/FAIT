import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'elevated' | 'flat';
  hover?: boolean;
  as?: React.ElementType;
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  className = '',
  children,
  variant = 'default',
  hover = false,
  as: Component = 'div',
  ...props
}) => {
  const baseClasses = 'rounded-lg overflow-hidden';
  
  const variantClasses = {
    default: 'bg-white shadow-card border border-neutral-100',
    bordered: 'bg-white border border-neutral-200',
    elevated: 'bg-white shadow-md',
    flat: 'bg-neutral-50',
  };
  
  const hoverClasses = hover ? 'transition-shadow duration-200 hover:shadow-card-hover' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;
  
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  className = '', 
  children,
  ...props
}) => {
  return (
    <div className={`px-6 py-4 border-b border-neutral-100 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({ 
  className = '', 
  children,
  ...props
}) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({ 
  className = '', 
  children,
  ...props
}) => {
  return (
    <div className={`px-6 py-4 border-t border-neutral-100 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Object.assign(Card, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
});
