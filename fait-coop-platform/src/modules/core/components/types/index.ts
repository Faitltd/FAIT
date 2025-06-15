/**
 * Core Component Types
 * 
 * This file defines the common types used across components.
 */

import React from 'react';

/**
 * Base component props that all components should support
 */
export interface BaseComponentProps {
  /** Custom CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Props for components that can have children
 */
export interface WithChildrenProps {
  /** Child elements */
  children?: React.ReactNode;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * Props for components that can have a loading state
 */
export interface LoadableProps {
  /** Whether the component is in a loading state */
  loading?: boolean;
}

/**
 * Props for components that can have a size
 */
export interface SizeableProps {
  /** Component size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Props for components that can have a variant
 */
export interface VariantProps {
  /** Component variant */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

/**
 * Props for components that can have an outline
 */
export interface OutlineableProps {
  /** Whether the component has an outline style */
  outline?: boolean;
}

/**
 * Props for components that can be rounded
 */
export interface RoundableProps {
  /** Whether the component has rounded corners */
  rounded?: boolean;
}

/**
 * Props for components that can have a label
 */
export interface LabelableProps {
  /** Component label */
  label?: string;
  /** Whether to hide the label visually (still available for screen readers) */
  hideLabel?: boolean;
}

/**
 * Props for components that can have a placeholder
 */
export interface PlaceholderProps {
  /** Component placeholder */
  placeholder?: string;
}

/**
 * Props for components that can have a value
 */
export interface ValueProps<T> {
  /** Component value */
  value?: T;
  /** Default value */
  defaultValue?: T;
  /** Callback when value changes */
  onChange?: (value: T) => void;
}

/**
 * Props for components that can have an error
 */
export interface ErrorProps {
  /** Error message */
  error?: string;
  /** Whether the component has an error */
  hasError?: boolean;
}

/**
 * Props for components that can have a help text
 */
export interface HelpTextProps {
  /** Help text */
  helpText?: string;
}

/**
 * Props for components that can be validated
 */
export interface ValidatableProps {
  /** Whether the component is required */
  required?: boolean;
  /** Validation function */
  validate?: (value: any) => string | null;
}

/**
 * Props for components that can be focused
 */
export interface FocusableProps {
  /** Whether the component should be auto-focused */
  autoFocus?: boolean;
  /** Callback when component is focused */
  onFocus?: (event: React.FocusEvent) => void;
  /** Callback when component loses focus */
  onBlur?: (event: React.FocusEvent) => void;
}

/**
 * Props for components that can be clicked
 */
export interface ClickableProps {
  /** Callback when component is clicked */
  onClick?: (event: React.MouseEvent) => void;
}

/**
 * Props for components that can have an icon
 */
export interface IconProps {
  /** Icon element */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
}

/**
 * Props for components that can have a tooltip
 */
export interface TooltipProps {
  /** Tooltip content */
  tooltip?: string;
  /** Tooltip position */
  tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Props for components that can be animated
 */
export interface AnimatableProps {
  /** Whether to animate the component */
  animate?: boolean;
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Animation delay in seconds */
  animationDelay?: number;
  /** Animation type */
  animationType?: 'fade' | 'slide' | 'scale' | 'rotate' | 'none';
}

/**
 * Props for components that can be revealed on scroll
 */
export interface ScrollRevealProps {
  /** Whether to reveal the component on scroll */
  revealOnScroll?: boolean;
  /** Viewport threshold for revealing (0-1) */
  threshold?: number;
  /** Reveal animation type */
  revealAnimation?: 'fade' | 'slide' | 'scale' | 'rotate' | 'none';
  /** Reveal animation duration in seconds */
  revealDuration?: number;
  /** Reveal animation delay in seconds */
  revealDelay?: number;
}

/**
 * Props for components that can have a background color
 */
export interface BackgroundProps {
  /** Background color */
  backgroundColor?: string;
}

/**
 * Props for components that can have a text color
 */
export interface TextColorProps {
  /** Text color */
  textColor?: string;
}

/**
 * Props for components that can have a border
 */
export interface BorderProps {
  /** Border color */
  borderColor?: string;
  /** Border width */
  borderWidth?: string;
  /** Border style */
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
}

/**
 * Props for components that can have padding
 */
export interface PaddingProps {
  /** Padding (all sides) */
  padding?: string;
  /** Padding top */
  paddingTop?: string;
  /** Padding right */
  paddingRight?: string;
  /** Padding bottom */
  paddingBottom?: string;
  /** Padding left */
  paddingLeft?: string;
}

/**
 * Props for components that can have margin
 */
export interface MarginProps {
  /** Margin (all sides) */
  margin?: string;
  /** Margin top */
  marginTop?: string;
  /** Margin right */
  marginRight?: string;
  /** Margin bottom */
  marginBottom?: string;
  /** Margin left */
  marginLeft?: string;
}

/**
 * Props for components that can have a width
 */
export interface WidthProps {
  /** Width */
  width?: string;
  /** Max width */
  maxWidth?: string;
  /** Min width */
  minWidth?: string;
  /** Full width (100%) */
  fullWidth?: boolean;
}

/**
 * Props for components that can have a height
 */
export interface HeightProps {
  /** Height */
  height?: string;
  /** Max height */
  maxHeight?: string;
  /** Min height */
  minHeight?: string;
  /** Full height (100%) */
  fullHeight?: boolean;
}

/**
 * Props for components that can have a position
 */
export interface PositionProps {
  /** Position */
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  /** Top position */
  top?: string;
  /** Right position */
  right?: string;
  /** Bottom position */
  bottom?: string;
  /** Left position */
  left?: string;
  /** Z-index */
  zIndex?: number;
}

/**
 * Props for components that can have a display
 */
export interface DisplayProps {
  /** Display */
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'none';
}

/**
 * Props for components that can have flex properties
 */
export interface FlexProps {
  /** Flex direction */
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  /** Flex wrap */
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /** Justify content */
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  /** Align items */
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  /** Align content */
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
  /** Flex grow */
  flexGrow?: number;
  /** Flex shrink */
  flexShrink?: number;
  /** Flex basis */
  flexBasis?: string;
  /** Flex (shorthand) */
  flex?: string;
}

/**
 * Props for components that can have grid properties
 */
export interface GridProps {
  /** Grid template columns */
  gridTemplateColumns?: string;
  /** Grid template rows */
  gridTemplateRows?: string;
  /** Grid template areas */
  gridTemplateAreas?: string;
  /** Grid column gap */
  gridColumnGap?: string;
  /** Grid row gap */
  gridRowGap?: string;
  /** Grid gap (shorthand) */
  gridGap?: string;
  /** Grid auto columns */
  gridAutoColumns?: string;
  /** Grid auto rows */
  gridAutoRows?: string;
  /** Grid auto flow */
  gridAutoFlow?: 'row' | 'column' | 'row dense' | 'column dense';
  /** Grid column */
  gridColumn?: string;
  /** Grid row */
  gridRow?: string;
  /** Grid area */
  gridArea?: string;
}
