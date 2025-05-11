import React from 'react';
import classNames from 'classnames';

// Heading Component
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: 'default' | 'primary' | 'secondary' | 'muted';
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  as,
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const Component = as || `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  const variantClasses = {
    default: 'text-gray-900',
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    muted: 'text-gray-500',
  };
  
  const sizeClasses = {
    1: 'text-4xl font-extrabold tracking-tight',
    2: 'text-3xl font-bold tracking-tight',
    3: 'text-2xl font-semibold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-medium',
    6: 'text-base font-medium',
  };
  
  const classes = classNames(
    sizeClasses[level],
    variantClasses[variant],
    className
  );
  
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

// Subheading Component
interface SubheadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3;
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: 'default' | 'primary' | 'secondary' | 'muted';
  className?: string;
}

export const Subheading: React.FC<SubheadingProps> = ({
  level = 1,
  as,
  variant = 'muted',
  className = '',
  children,
  ...props
}) => {
  const Component = as || (level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4') as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  const variantClasses = {
    default: 'text-gray-900',
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    muted: 'text-gray-500',
  };
  
  const sizeClasses = {
    1: 'text-xl font-medium',
    2: 'text-lg font-medium',
    3: 'text-base font-medium',
  };
  
  const classes = classNames(
    sizeClasses[level],
    variantClasses[variant],
    className
  );
  
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

// Paragraph Component
interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary' | 'muted';
  className?: string;
}

export const Paragraph: React.FC<ParagraphProps> = ({
  size = 'md',
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'text-gray-700',
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    muted: 'text-gray-500',
  };
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  const classes = classNames(
    sizeClasses[size],
    variantClasses[variant],
    className
  );
  
  return (
    <p className={classes} {...props}>
      {children}
    </p>
  );
};

// Text Component (for spans, etc.)
interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'muted' | 'error' | 'success' | 'warning';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  as?: React.ElementType;
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  size = 'md',
  variant = 'default',
  weight = 'normal',
  as: Component = 'span',
  className = '',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'text-gray-900',
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    muted: 'text-gray-500',
    error: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  };
  
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };
  
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };
  
  const classes = classNames(
    sizeClasses[size],
    variantClasses[variant],
    weightClasses[weight],
    className
  );
  
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};
