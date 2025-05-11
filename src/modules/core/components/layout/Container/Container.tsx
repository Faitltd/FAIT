/**
 * Container Component
 * 
 * A container component for layout.
 */

import React, { forwardRef } from 'react';
import {
  BaseComponentProps,
  WithChildrenProps,
  PaddingProps,
  MarginProps,
  WidthProps,
  BackgroundProps
} from '../../types';
import { composeClasses, composeStyles } from '../../utils';

export interface ContainerProps extends 
  BaseComponentProps,
  WithChildrenProps,
  PaddingProps,
  MarginProps,
  WidthProps,
  BackgroundProps {
  /** Whether the container is fluid (full width) */
  fluid?: boolean;
  /** Container tag */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Container component
 * 
 * @example
 * ```tsx
 * <Container>
 *   <h1>Hello World</h1>
 *   <p>This is a container</p>
 * </Container>
 * ```
 */
export const Container = forwardRef<HTMLElement, ContainerProps>(({
  className,
  style,
  children,
  fluid = false,
  as: Component = 'div',
  padding,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  margin,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  width,
  maxWidth,
  minWidth,
  fullWidth = false,
  backgroundColor,
  ...props
}, ref) => {
  // Compose container classes
  const containerClasses = composeClasses(
    fluid ? 'container-fluid' : 'container',
    {
      'w-100': fullWidth,
    },
    className
  );
  
  // Compose container styles
  const containerStyles = composeStyles(
    style,
    {
      padding,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      margin,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      width,
      maxWidth,
      minWidth,
      backgroundColor,
    }
  );

  return (
    <Component
      ref={ref as any}
      className={containerClasses}
      style={containerStyles}
      {...props}
    >
      {children}
    </Component>
  );
});

Container.displayName = 'Container';

export default Container;
