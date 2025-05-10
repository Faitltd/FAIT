# Component Structure Refactoring

This document outlines the refactoring of the component structure in the FAIT Co-op platform.

## Overview

The component structure has been refactored to improve maintainability, reusability, and code organization. The new system follows the modular architecture pattern and provides a clean, consistent API for UI components.

## Key Changes

1. **Modular Architecture**: Component code has been organized into the `src/modules/core/components` directory, following the modular architecture pattern.

2. **Standardized Component Interfaces**: Created consistent prop interfaces for all components.

3. **Component Categorization**: Organized components into categories (layout, form, animation, etc.).

4. **Utility Functions**: Added utility functions for component composition.

5. **Custom Hooks**: Created reusable hooks for common component functionality.

6. **Better Type Safety**: Added comprehensive TypeScript types for component-related code.

7. **Animation Support**: Added built-in support for animations and scroll reveal effects.

## Directory Structure

```
src/modules/core/components/
  ├── animation/           # Animation components
  │   ├── ScrollReveal/    # Scroll reveal component
  │   └── index.ts         # Animation components barrel file
  ├── form/                # Form components
  │   ├── Button/          # Button component
  │   ├── Input/           # Input component
  │   └── index.ts         # Form components barrel file
  ├── layout/              # Layout components
  │   ├── Container/       # Container component
  │   ├── Grid/            # Grid component
  │   └── index.ts         # Layout components barrel file
  ├── hooks/               # Component hooks
  │   ├── useScrollReveal.ts # Scroll reveal hook
  │   ├── useMediaQuery.ts # Media query hook
  │   ├── useFormInput.ts  # Form input hook
  │   └── index.ts         # Hooks barrel file
  ├── utils/               # Component utilities
  │   ├── composeClasses.ts # Class composition utility
  │   ├── composeStyles.ts # Style composition utility
  │   ├── filterProps.ts   # Prop filtering utility
  │   └── index.ts         # Utilities barrel file
  ├── types/               # Component types
  │   └── index.ts         # Types definitions
  ├── index.ts             # Components barrel file
  └── README.md            # Components documentation
```

## Usage

### Basic Components

```tsx
import { Button, Input, Container, Grid } from '@/modules/core/components';

function MyComponent() {
  return (
    <Container>
      <h1>Hello World</h1>
      <Grid columns={2} gap="1rem">
        <div>
          <Input label="Name" placeholder="Enter your name" />
        </div>
        <div>
          <Button variant="primary">Submit</Button>
        </div>
      </Grid>
    </Container>
  );
}
```

### Animation Components

```tsx
import { ScrollReveal } from '@/modules/core/components';

function MyComponent() {
  return (
    <div>
      <ScrollReveal>
        <h1>This will fade in when scrolled into view</h1>
      </ScrollReveal>
      
      <ScrollReveal
        revealAnimation="slide"
        direction="up"
        revealDuration={0.6}
        threshold={0.2}
      >
        <p>This will slide up when scrolled into view</p>
      </ScrollReveal>
    </div>
  );
}
```

### Component Hooks

```tsx
import { useScrollReveal, useMediaQuery, useFormInput } from '@/modules/core/components';

function MyComponent() {
  // Scroll reveal hook
  const { ref, isRevealed } = useScrollReveal({ threshold: 0.2 });
  
  // Media query hook
  const isMobile = useMediaQuery('xs');
  
  // Form input hook
  const { value, error, touched, handleChange, handleBlur } = useFormInput({
    initialValue: '',
    validate: (value) => value ? null : 'This field is required'
  });
  
  return (
    <div>
      <div ref={ref} style={{ opacity: isRevealed ? 1 : 0 }}>
        This will be revealed on scroll
      </div>
      
      {isMobile ? (
        <div>Mobile View</div>
      ) : (
        <div>Desktop View</div>
      )}
      
      <input
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched && error && <div>{error}</div>}
    </div>
  );
}
```

### Utility Functions

```tsx
import { composeClasses, composeStyles, filterProps } from '@/modules/core/components';

// Compose CSS classes
const className = composeClasses(
  'btn',
  'btn-primary',
  { 'btn-large': isLarge, 'btn-disabled': isDisabled }
);

// Compose inline styles
const style = composeStyles(
  { color: 'blue' },
  isLarge && { fontSize: '20px' },
  isDisabled && { opacity: 0.5 }
);

// Filter props
const buttonProps = filterProps(props, ['onClick', 'disabled', 'type']);
```

## Migration Guide

To migrate existing components to use the new component structure:

1. Import components from `@/modules/core/components` instead of directly from their files.

2. Use the standardized prop interfaces for component props.

3. Use the utility functions for class and style composition.

4. Use the hooks for common component functionality.

## Next Steps

1. Migrate all existing components to use the new structure.

2. Add comprehensive tests for all components.

3. Create additional components for common UI patterns.

4. Enhance the animation system with more effects and options.

5. Create a component documentation site or storybook.
