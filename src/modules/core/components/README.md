# Core Components

This module provides a set of reusable UI components for the FAIT Co-op platform. These components follow consistent patterns and are designed to be composable and maintainable.

## Component Categories

The components are organized into the following categories:

1. **Layout Components**: Components for page layout and structure
2. **Form Components**: Components for form inputs and controls
3. **Feedback Components**: Components for user feedback (alerts, toasts, etc.)
4. **Navigation Components**: Components for navigation (menus, tabs, etc.)
5. **Data Display Components**: Components for displaying data (tables, cards, etc.)
6. **Modal Components**: Components for modals and dialogs
7. **Animation Components**: Components with animation effects

## Directory Structure

```
/components
  /layout          # Layout components
  /form            # Form components
  /feedback        # Feedback components
  /navigation      # Navigation components
  /data-display    # Data display components
  /modal           # Modal components
  /animation       # Animation components
  /hooks           # Component-related hooks
  /utils           # Component utility functions
  /types           # Component type definitions
  /context         # Component contexts
  index.ts         # Public API exports
```

## Component Design Principles

1. **Composability**: Components should be composable and reusable
2. **Consistency**: Components should follow consistent patterns and naming conventions
3. **Accessibility**: Components should be accessible and follow WCAG guidelines
4. **Performance**: Components should be optimized for performance
5. **Testability**: Components should be easy to test
6. **Documentation**: Components should be well-documented

## Usage Guidelines

### Component Props

All components should follow these prop patterns:

1. **className**: For custom CSS classes
2. **style**: For inline styles
3. **children**: For child elements
4. **data-testid**: For testing
5. **Component-specific props**: For component-specific functionality

### Component Structure

Components should be structured as follows:

```tsx
import React from 'react';
import { ComponentProps } from './types';
import styles from './Component.module.css';

export const Component: React.FC<ComponentProps> = ({
  className,
  style,
  children,
  ...props
}) => {
  return (
    <div className={`${styles.component} ${className || ''}`} style={style} {...props}>
      {children}
    </div>
  );
};

export default Component;
```

### Component Exports

Components should be exported from their respective directories using an index.ts file:

```tsx
// /components/layout/index.ts
export { default as Container } from './Container';
export { default as Grid } from './Grid';
export { default as Row } from './Row';
export { default as Column } from './Column';
```

## Animation Guidelines

Components with animations should:

1. Use Framer Motion for animations
2. Support scroll-activated reveal with 0.6s transitions
3. Use 0.2 viewport threshold for scroll animations
4. Implement opacity and slide animations
5. Use minimal styling and liberal whitespace

## Accessibility Guidelines

Components should:

1. Use semantic HTML elements
2. Include proper ARIA attributes
3. Support keyboard navigation
4. Have sufficient color contrast
5. Include focus indicators
6. Support screen readers
